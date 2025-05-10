<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="header">
      <view class="search-bar">
        <view class="search-input" @click="goSearch">
          <text class="iconfont icon-search"></text>
          <text class="placeholder">搜索商品</text>
        </view>
      </view>
    </view>
    
    <!-- 轮播图 -->
    <swiper class="banner animate__animated animate__fadeIn" 
            :indicator-dots="true" 
            :autoplay="true"
            :interval="3000"
            :duration="500"
            indicator-active-color="#FFC300">
      <swiper-item v-for="(item, index) in banners" :key="index" class="animate__animated animate__fadeIn">
        <image :src="item.image" mode="aspectFill"/>
      </swiper-item>
    </swiper>
    
    <!-- 分类导航 -->
    <view class="category-nav">
      <scroll-view scroll-x class="category-scroll">
        <view class="category-item" 
              v-for="item in categories" 
              :key="item.id"
              :class="{'active': currentCategory === item.id}"
              @click="goCategory(item.id)">
          <text>{{item.name}}</text>
        </view>
      </scroll-view>
    </view>
    
    <!-- 推荐商品 -->
    <view class="recommend">
      <view class="section-title">
        <text class="title">猜你喜欢</text>
        <text class="subtitle">为你精选好物</text>
      </view>
      <view class="product-list">
        <view class="product-item" 
              v-for="item in recommendProducts" 
              :key="item.id"
              @click="goDetail(item.id)">
          <image :src="item.image || '/static/images/default.png'" mode="aspectFill"/>
          <view class="info">
            <text class="name">{{item.name}}</text>
            <view class="price-wrap">
              <text class="price">¥{{item.price}}</text>
              <text class="sold">已售{{item.soldCount || 0}}件</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getRecommendProducts, getProductList, getCategoryList, searchProducts } from '@/api/product'

export default {
  data() {
    return {
      banners: [
        { image: '/static/images/bg1.jpeg' },
        { image: '/static/images/bg2.jpeg' },
        { image: '/static/images/bg3.jpeg' }
      ],
      categories: [],
      currentCategory: null,
      recommendProducts: [],
      searchKeyword: ''
    }
  },
  
  onLoad() {
    this.getCategories()
    this.getRecommendProducts()
  },
  
  onPullDownRefresh() {
    this.getRecommendProducts()
    setTimeout(() => {
      uni.stopPullDownRefresh()
    }, 1000)
  },
  
  methods: {
    async getRecommendProducts() {
      try {
		  if (!uni.getStorageSync('token')) {
		     uni.showToast({
		     	title:"还没登录"
		     })
		  	uni.redirectTo({
		  		url:"/pages/login/login"
		  	})
		  }
        // 如果有搜索关键字，则调用搜索接口
        if (this.searchKeyword) {
          const res = await searchProducts(this.searchKeyword)
          if (res.code === 1 && res.data) {
            this.recommendProducts = res.data.map(item => ({
              ...item,
              soldCount: Math.floor(Math.random() * (100 - 20 + 1)) + 20
            }))
          }
        } else {
          // 否则获取所有商品
          const res = await getProductList()
          if (res.code === 1 && res.data && res.data.length > 0) {
            this.recommendProducts = this.getRandomItems(res.data, 5).map(item => ({
              ...item,
              soldCount: Math.floor(Math.random() * (100 - 20 + 1)) + 20
            }))
          }
        }
        console.log('推荐商品:', this.recommendProducts)
      } catch (e) {
        console.error('获取商品失败:', e)
        uni.showToast({
          title: '获取商品失败',
          icon: 'none'
        })
      }
    },
    
    // 从数组中随机获取指定数量的元素
    getRandomItems(array, count) {
      const shuffled = [...array].sort(() => 0.5 - Math.random())
      return shuffled.slice(0, count)
    },
    
    goSearch() {
      uni.navigateTo({
        url: '/pages/search/index'
      })
    },
    
    goDetail(id) {
      uni.navigateTo({
        url: `/pages/product/detail?id=${id}`
      })
    },
    
    async getCategories() {
      try {
        const res = await getCategoryList()
        if (res.code === 1 && res.data) {
          this.categories = res.data
          if (this.categories.length > 0) {
            this.currentCategory = this.categories[0].id
          }
        }
      } catch (e) {
        console.error('获取分类失败:', e)
      }
    },
    
    goCategory(id) {
      this.currentCategory = id
      // 将选中的分类ID存储到本地
      uni.setStorageSync('selectedCategoryId', id)
      // 使用switchTab跳转到分类页面
      uni.switchTab({
        url: '/pages/category/category',
        fail: (err) => {
          console.error('跳转失败:', err)
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          })
        }
      })
    },
    
    // 处理搜索
    handleSearch(keyword) {
      this.searchKeyword = keyword
      this.getRecommendProducts()
    }
  }
}
</script>

<style lang="scss">
@import '@/static/styles/common.scss';

// 定义动画
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 100%, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }
  to {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
}

// 动画类
.animate__fadeIn {
  animation: fadeIn 0.3s ease both;
}

.animate__fadeInUp {
  animation: fadeInUp 0.3s ease both;
}

.animate__zoomIn {
  animation: zoomIn 0.3s ease both;
}

.container {
  min-height: 100vh;
  background: #FFFBEB;
}

.header {
  background: #FBE300;
  padding: 0;
  padding-top: env(safe-area-inset-top);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 200rpx;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-bottom: 20rpx;
  
  .search-bar {
    flex: 0;
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    margin-top: 0;
    
    .search-input {
      width: 100%;
      background: #fff;
      border-radius: 36rpx;
      height: 72rpx;
      display: flex;
      align-items: center;
      padding: 0 30rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
      
      .iconfont {
        font-size: 32rpx;
        color: #666;
        margin-right: 10rpx;
      }
      
      .placeholder {
        font-size: 28rpx;
        color: #999;
      }
    }
  }
}

.banner {
  width: 100%;
  height: 340rpx;
  margin-top: 200rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
  
  swiper-item {
    border-radius: 12rpx;
    overflow: hidden;
    transform: scale(0.98);
    transition: all 0.3s ease;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    
    &.active {
      transform: scale(1);
    }
  }
  
  image {
    width: 100%;
    height: 100%;
    border-radius: 12rpx;
  }
}

.category-nav {
  margin: 40rpx 30rpx 30rpx;
  position: relative;
  background: #fff;
  padding: 20rpx 0;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
  
  .category-scroll {
    white-space: nowrap;
    overflow: hidden;
    padding: 10rpx 20rpx;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
  
  .category-item {
    display: inline-block;
    position: relative;
    margin-right: 48rpx;
    padding: 8rpx 4rpx;
    transition: all 0.3s ease;
    
    &:last-child {
      margin-right: 20rpx;
    }
    
    text {
      font-size: 30rpx;
      color: #999;
      font-weight: 400;
      letter-spacing: 2rpx;
      position: relative;
      transition: all 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -8rpx;
        left: 50%;
        width: 0;
        height: 4rpx;
        background: #FBE300;
        border-radius: 4rpx;
        transform: translateX(-50%);
        transition: all 0.3s ease;
      }
    }
    
    &.active {
      text {
        color: #222;
        font-weight: 600;
        transform: scale(1.05);
        
        &::after {
          width: 80%;
        }
      }
    }
    
    &:active {
      opacity: 0.7;
    }
  }
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 40rpx;
    z-index: 1;
    pointer-events: none;
  }
  
  &::before {
    left: 0;
    background: linear-gradient(to right, #fff 30%, transparent);
  }
  
  &::after {
    right: 0;
    background: linear-gradient(to left, #fff 30%, transparent);
  }
}

.recommend {
  background: #fff;
  margin: 20rpx;
  border-radius: 12rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(251, 227, 0, 0.08);
  
  .section-title {
    margin-bottom: 30rpx;
    display: flex;
    align-items: center;
    padding: 16rpx 24rpx;
    border: 1px solid rgba(251, 227, 0, 0.2);
    border-radius: 8rpx;
    background: rgba(251, 227, 0, 0.03);
    
    .title {
      font-size: 32rpx;
      color: #333;
      font-weight: bold;
    }
    
    .subtitle {
      font-size: 24rpx;
      color: #999;
      margin-left: 20rpx;
    }
  }
}

.product-list {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10rpx;
  
  .product-item {
    width: calc(50% - 20rpx);
    margin: 10rpx;
    background: #fff;
    border-radius: 12rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 8rpx rgba(251, 227, 0, 0.08);
    
    &:active {
      transform: scale(0.98);
    }
    
    image {
      width: 100%;
      height: 300rpx;
    }
    
    .info {
      padding: 20rpx;
      
      .name {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 16rpx;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.4;
      }
      
      .price-wrap {
        display: flex;
        align-items: center;
        justify-content: space-between;
        
        .price {
          font-size: 36rpx;
          color: #FF6633;
          font-weight: bold;
          
          &::before {
            content: '¥';
            font-size: 24rpx;
            margin-right: 2rpx;
          }
        }
        
        .sold {
          font-size: 22rpx;
          color: #999;
          background: #FFFBEB;
          padding: 4rpx 12rpx;
          border-radius: 20rpx;
        }
      }
    }
  }
}

// 搜索结果为空的样式
.empty-search {
  text-align: center;
  padding: 100rpx 0;
  
  image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 20rpx;
  }
  
  text {
    font-size: 28rpx;
    color: #999;
  }
  
  .reset-btn {
    margin-top: 30rpx;
    padding: 10rpx 30rpx;
    font-size: 28rpx;
    color: #FFD000;
    border: 1rpx solid #FFD000;
    border-radius: 30rpx;
    display: inline-block;
  }
}
</style>