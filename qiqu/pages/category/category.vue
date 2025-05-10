<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <text>商品分类</text>
    </view>
    
    <!-- 加载状态 -->
    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>
    
    <!-- 主体内容区 -->
    <view class="content">
      <!-- 左侧分类列表 -->
      <scroll-view 
        class="category-list" 
        scroll-y 
        :scroll-top="scrollTop"
        @scroll="onScroll"
      >
        <view 
          class="category-item"
          v-for="item in categories"
          :key="item.id"
          :class="{ active: currentCategory.id === item.id }"
          @click="switchCategory(item)"
        >
          <text>{{ item.name }}</text>
        </view>
      </scroll-view>
      
      <!-- 右侧商品列表 -->
      <scroll-view 
        class="product-list" 
        scroll-y
        :scroll-top="productScrollTop"
        @scroll="onProductScroll"
        @scrolltolower="loadMore"
        refresher-enabled
        :refresher-triggered="isRefreshing"
        @refresherrefresh="onRefresh"
      >
        <view 
          class="product-item"
          v-for="item in products"
          :key="item.id"
          @click="goDetail(item.id)"
        >
          <image :src="item.image || '/static/images/default.png'" mode="aspectFill"/>
          <view class="info">
            <text class="name">{{ item.name }}</text>
            <text class="price">¥{{ item.price }}</text>
            <text class="desc">{{ item.description }}</text>
          </view>
        </view>
        
        <!-- 空状态 -->
        <view class="empty" v-if="products.length === 0">
          <text>暂无商品</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { getCategoryList } from '@/api/category'
import { sendEmailCode } from '@/api/user'

export default {
  data() {
    return {
      categories: [],
      currentCategory: {},
      products: [],
      loading: false,
      scrollTop: 0,
      productScrollTop: 0,
      defaultCategoryId: null,
      isRefreshing: false
    }
  },
  onShow() {
    // 如果没有分类数据，则重新获取
    if (this.categories.length === 0) {
      this.getCategories()
    }
    
    // 获取首页选中的分类ID
    const selectedId = uni.getStorageSync('selectedCategoryId')
    if (selectedId) {
      // 切换到选中的分类
      const category = this.categories.find(item => item.id === selectedId)
      if (category) {
        this.switchCategory(category)
      }
      // 清除存储的分类ID
      uni.removeStorageSync('selectedCategoryId')
    }
  },
  onLoad(options) {
    if(options.id) {
      this.defaultCategoryId = Number(options.id)
    }
    this.getCategories(options.id)
  },
  onTabItemTap() {
    // 如果没有分类数据，则重新获取
    if (this.categories.length === 0) {
      this.getCategories()
    }
  },
  onHide() {
    uni.setStorageSync('categoryData', {
      categories: this.categories,
      currentCategory: this.currentCategory,
      products: this.products
    })
  },
  onShow() {
    const savedData = uni.getStorageSync('categoryData')
    if (savedData) {
      this.categories = savedData.categories
      this.currentCategory = savedData.currentCategory
      this.products = savedData.products
      if(this.defaultCategoryId) {
        const category = this.categories.find(item => item.id === this.defaultCategoryId)
        if(category) {
          this.switchCategory(category)
        }
        this.defaultCategoryId = null
      }
    } else if (this.categories.length === 0) {
      this.getCategories()
    }
  },
  onPullDownRefresh() {
    this.refreshData()
  },
  methods: {
    onScroll(e) {
      this.scrollTop = e.detail.scrollTop
    },
    onProductScroll(e) {
      this.productScrollTop = e.detail.scrollTop
    },
    async getCategories(defaultId) {
      if (this.loading) return
      
      this.loading = true
      try {
        const res = await getCategoryList()
        if(res.code === 1 && res.data && res.data.length > 0) {
          // 过滤活跃的分类
          this.categories = res.data.filter(item => item.isActive)
          
          // 设置默认分类
          if(defaultId) {
            this.currentCategory = this.categories.find(item => item.id === Number(defaultId)) || this.categories[0]
          } else if (this.currentCategory.id) {
            // 如果当前已有选中分类，则保持选中状态
            const currentCategory = this.categories.find(item => item.id === this.currentCategory.id)
            this.currentCategory = currentCategory || this.categories[0]
          } else {
            this.currentCategory = this.categories[0]
          }
          
          // 更新商品列表
          if(this.currentCategory) {
            this.products = this.currentCategory.products || []
          }
        } else {
          this.categories = []
          this.products = []
          this.currentCategory = {}
          uni.showToast({
            title: '暂无分类数据',
            icon: 'none'
          })
        }
      } catch(e) {
        console.error('获取分类失败:', e)
        uni.showToast({
          title: '获取分类失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
        if(this.isRefreshing) {
          this.isRefreshing = false
          uni.stopPullDownRefresh()
        }
      }
    },
    switchCategory(item) {
      if(!item || !item.id) return
      if (this.currentCategory.id === item.id) return // 避免重复切换相同分类
      
      this.currentCategory = item
      this.products = item.products || []
      
      // 切换分类时滚动到顶部
      this.productScrollTop = 0
    },
    async onRefresh() {
      await this.refreshData()
    },
    async refreshData() {
      this.isRefreshing = true
      this.categories = []
      this.products = []
      this.currentCategory = {}
      await this.getCategories()
      
      // 清除本地缓存
      uni.removeStorageSync('categoryData')
      
      // 停止下拉刷新动画
      uni.stopPullDownRefresh()
      this.isRefreshing = false
      
      // 显示刷新成功提示
      uni.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500
      })
    },
    goDetail(id) {
      uni.navigateTo({
        url: `/pages/product/detail?id=${id}`,
        fail: (err) => {
          console.error('跳转失败:', err)
          uni.showToast({
            title: '页面跳转失败',
            icon: 'none'
          })
        }
      })
    },
    // 发送邮箱验证码
    async handleSendEmailCode(username, email) {
      try {
        const res = await sendEmailCode({
          username,
          email
        })
        if (res.code === 1) {
          uni.showToast({
            title: res.message || '验证码已发送',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: res.message || '发送失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('发送验证码失败:', error)
        uni.showToast({
          title: '发送失败，请重试',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss">
/* 修改页面级别样式 */
page {
  height: 100%;
  background: #f5f5f5;
}

/* 修改容器样式 */
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
  padding-top: var(--status-bar-height);
}

/* 添加导航栏样式 */
.nav-bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 1rpx;
    background: #f5f5f5;
    transform: scaleY(0.5);
  }
}

/* 添加内容区样式 */
.content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 修改左侧分类列表样式 */
.category-list {
  width: 200rpx;
  height: 100%;
  background: #ffffff;
  
  .category-item {
    height: 100rpx;
    padding: 0 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    
    &.active {
      background: #f5f5f5;
      font-weight: bold;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        height: 36rpx;
        width: 6rpx;
        background: #FE8C00;
      }
    }
  }
}

/* 优化右侧商品列表样式 */
.product-list {
  flex: 1;
  height: 100%;
  background: #ffffff;
  padding: 20rpx;
  
  .product-item {
    display: flex;
    padding: 20rpx;
    margin-bottom: 20rpx;
    background: #ffffff;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
    
    image {
      width: 160rpx;
      height: 160rpx;
      border-radius: 8rpx;
      margin-right: 20rpx;
      flex-shrink: 0;
    }
    
    .info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-width: 0; /* 防止文本溢出 */
      
      .name {
        font-size: 28rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 12rpx;
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      
      .desc {
        font-size: 24rpx;
        color: #999;
        margin-bottom: 12rpx;
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      }
      
      .price {
        color: #FF4444;
        font-size: 32rpx;
        font-weight: bold;
        
        &::before {
          content: '¥';
          font-size: 24rpx;
          margin-right: 2rpx;
        }
      }
    }
  }
}

/* 优化加载和空状态样式 */
.loading, .empty {
  padding: 30rpx;
  text-align: center;
  color: #999;
  font-size: 26rpx;
  background: #ffffff;
}
</style> 