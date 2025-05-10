<template>
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="mt-header">
      <view class="header-content">
        <text class="iconfont icon-back back-icon" @click="goBack"></text>
        <text class="title">{{currentCategory ? currentCategory.name : '分类'}}</text>
      </view>
    </view>
    
    <!-- 分类列表 -->
    <view class="category-container" :style="{ paddingTop: '128rpx' }">
      <!-- 左侧分类导航 -->
      <scroll-view scroll-y class="category-nav">
        <view class="nav-item" 
              v-for="item in categories" 
              :key="item.id"
              :class="{'active': currentCategory && currentCategory.id === item.id}"
              @click="selectCategory(item)">
          <text>{{item.name}}</text>
        </view>
      </scroll-view>
      
      <!-- 右侧商品列表 -->
      <scroll-view scroll-y class="product-container" @scrolltolower="loadMore">
        <view class="product-list">
          <view class="product-item" 
                v-for="item in products" 
                :key="item.id"
                @click="goDetail(item.id)">
            <image :src="item.image || '/static/images/default.png'" mode="aspectFill"/>
            <view class="info">
              <text class="name">{{item.name}}</text>
              <view class="price-wrap">
                <text class="mt-price">{{item.price}}</text>
                <text class="sold">已售{{item.soldCount || 0}}件</text>
              </view>
            </view>
          </view>
        </view>
        <!-- 加载更多 -->
        <view class="mt-loading" v-if="loading">加载中...</view>
        <view class="mt-empty" v-if="products.length === 0 && !loading">
          <image src="/static/images/empty.png"/>
          <text class="text">暂无商品</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { getCategoryList, getProductList } from '@/api/product'

export default {
  data() {
    return {
      categories: [],
      currentCategory: null,
      products: [],
      loading: false,
      pageNum: 1,
      pageSize: 10,
      hasMore: true
    }
  },
  
  onLoad(options) {
    if (options.id) {
      this.getCategories(options.id)
    }
  },
  
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    async getCategories(selectedId) {
      try {
        const res = await getCategoryList()
        if (res.code === 1 && res.data) {
          this.categories = res.data
          if (selectedId) {
            this.currentCategory = this.categories.find(item => item.id === parseInt(selectedId))
          } else if (this.categories.length > 0) {
            this.currentCategory = this.categories[0]
          }
          this.getProducts()
        }
      } catch (e) {
        console.error('获取分类失败:', e)
      }
    },
    
    async selectCategory(category) {
      this.currentCategory = category
      this.products = []
      this.pageNum = 1
      this.hasMore = true
      this.getProducts()
    },
    
    async getProducts() {
      if (!this.currentCategory || this.loading || !this.hasMore) return
      
      this.loading = true
      try {
        const res = await getProductList({
          categoryId: this.currentCategory.id,
          pageNum: this.pageNum,
          pageSize: this.pageSize
        })
        
        if (res.code === 1 && res.data) {
          // 为商品添加随机销量
          const productsWithSoldCount = res.data.map(item => ({
            ...item,
            soldCount: Math.floor(Math.random() * (100 - 20 + 1)) + 20 // 生成20-100的随机数
          }))
          
          if (this.pageNum === 1) {
            this.products = productsWithSoldCount
          } else {
            this.products = [...this.products, ...productsWithSoldCount]
          }
          
          this.hasMore = res.data.length === this.pageSize
          this.pageNum++
        }
      } catch (e) {
        console.error('获取商品失败:', e)
      } finally {
        this.loading = false
      }
    },
    
    loadMore() {
      if (this.hasMore) {
        this.getProducts()
      }
    },
    
    goDetail(id) {
      uni.navigateTo({
        url: `/pages/product/detail?id=${id}`
      })
    }
  }
}
</script>

<style lang="scss">
@import '@/static/styles/common.scss';

.category-container {
  display: flex;
  height: calc(100vh - 128rpx);
  
  .category-nav {
    width: 180rpx;
    height: 100%;
    background: #f8f8f8;
    
    .nav-item {
      height: 100rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      color: $text-color;
      position: relative;
      transition: all 0.3s ease;
      
      &.active {
        background: #fff;
        color: $primary-color;
        font-weight: bold;
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 6rpx;
          height: 36rpx;
          background: $primary-color;
          border-radius: 0 4rpx 4rpx 0;
        }
      }
    }
  }
  
  .product-container {
    flex: 1;
    height: 100%;
    background: #fff;
    
    .product-list {
      padding: 20rpx;
      
      .product-item {
        background: #fff;
        border-radius: 12rpx;
        margin-bottom: 20rpx;
        overflow: hidden;
        box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
        
        image {
          width: 100%;
          height: 320rpx;
          background: #f5f5f5;
        }
        
        .info {
          padding: 20rpx;
          
          .name {
            font-size: 28rpx;
            color: $text-color;
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
            
            .sold {
              font-size: 24rpx;
              color: $text-color-lighter;
              background: #f5f5f5;
              padding: 4rpx 12rpx;
              border-radius: 20rpx;
            }
          }
        }
      }
    }
  }
}
</style> 