<template>
  <view class="container">
    <!-- 搜索框 -->
    <view class="search-box">
      <view class="input-wrap">
        <input 
          type="text" 
          v-model="keyword" 
          placeholder="请输入商品名称" 
          @confirm="handleSearch"
          confirm-type="search"
          class="search-input"
        >
        <text v-if="keyword" class="clear-icon" @click="clearKeyword">×</text>
      </view>
      <text class="search-btn" @click="handleSearch">搜索</text>
      <text class="cancel" @click="goBack">取消</text>
    </view>

    <!-- 搜索结果 -->
    <view class="product-list" v-if="products.length > 0">
      <view 
        class="product-item" 
        v-for="item in products" 
        :key="item.id"
        @click="goDetail(item.id)"
      >
        <image :src="item.image" mode="aspectFill" class="product-image"></image>
        <view class="product-info">
          <text class="product-name">{{item.name}}</text>
          <text class="product-price">¥{{item.price}}</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty" v-else-if="keyword && !loading">
      <text>暂无相关商品</text>
    </view>
  </view>
</template>

<script>
import { searchProducts } from '@/api/search'

export default {
  data() {
    return {
      keyword: '',
      products: [],
      loading: false,
      page: 1,
      size: 10
    }
  },
  methods: {
    // 执行搜索
    async handleSearch() {
      const keyword = this.keyword.trim()
      if (!keyword) {
        uni.showToast({
          title: '请输入搜索关键词',
          icon: 'none'
        })
        return
      }
      
      this.loading = true
      try {
        const res = await searchProducts(
          keyword,
          this.page,
          this.size
        )
        console.log('搜索参数:', {
          keyword,
          page: this.page,
          size: this.size
        })
        
        if (res.code === 1) {
          this.products = res.data || []
          if (this.products.length === 0) {
            uni.showToast({
              title: '暂无相关商品',
              icon: 'none'
            })
          }
        } else {
          throw new Error(res.msg || '搜索失败')
        }
      } catch (e) {
        console.error('搜索失败:', e)
        uni.showToast({
          title: e.message || '搜索失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    // 清空关键词
    clearKeyword() {
      this.keyword = ''
      this.products = []
    },

    goDetail(id) {
      uni.navigateTo({
        url: `/pages/product/detail?id=${id}`
      })
    },

    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.search-box {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  
  .input-wrap {
    flex: 1;
    height: 72rpx;
    background: #f5f5f5;
    border-radius: 36rpx;
    padding: 0 30rpx;
    display: flex;
    align-items: center;
    margin-right: 20rpx;
    
    .search-input {
      flex: 1;
      height: 100%;
      font-size: 28rpx;
    }
    
    .clear-icon {
      padding: 0 10rpx;
      color: #999;
      font-size: 32rpx;
    }
  }
  
  .search-btn {
    padding: 0 20rpx;
    font-size: 28rpx;
    color: #333;
  }
  
  .cancel {
    padding-left: 20rpx;
    font-size: 28rpx;
    color: #666;
  }
}

.product-list {
  margin-top: 20rpx;
  
  .product-item {
    display: flex;
    padding: 20rpx;
    background: #fff;
    margin-bottom: 20rpx;
    border-radius: 12rpx;
    
    .product-image {
      width: 160rpx;
      height: 160rpx;
      border-radius: 8rpx;
    }
    
    .product-info {
      flex: 1;
      margin-left: 20rpx;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      
      .product-name {
        font-size: 28rpx;
        color: #333;
        line-height: 1.4;
      }
      
      .product-price {
        font-size: 32rpx;
        color: #ff4444;
        font-weight: bold;
      }
    }
  }
}

.empty {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style> 