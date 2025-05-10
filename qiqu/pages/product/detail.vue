<template>
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="mt-header">
      <view class="header-content">
        <text class="iconfont icon-back back-icon" @click="goBack"></text>
        <text class="title">商品详情</text>
      </view>
    </view>
    
    <!-- 商品信息 -->
    <scroll-view scroll-y class="detail-container" :style="{ paddingTop: '88rpx' }">
      <!-- 商品主图 -->
      <swiper class="product-swiper animate__animated animate__fadeIn" 
              :indicator-dots="true" 
              :autoplay="true"
              :interval="3000"
              :duration="500"
              indicator-active-color="#FFC300">
        <swiper-item class="animate__animated animate__zoomIn animate__slow">
          <image :src="product.image || '/static/images/default.png'" mode="aspectFill"/>
        </swiper-item>
      </swiper>
      
      <!-- 商品基本信息 -->
      <view class="product-info mt-card animate__animated animate__fadeInUp animate__delay-1">
        <view class="price-row">
          <text class="mt-price">{{product.price}}</text>
          <text class="sold">已售 {{soldCount}}</text>
        </view>
        <view class="name">{{product.name}}</view>
        <view class="desc">{{product.description}}</view>
      </view>
      
      <!-- 商品参数 -->
      <view class="product-params mt-card animate__animated animate__fadeInUp animate__delay-2">
        <view class="section-title">
          <text>商品参数</text>
        </view>
        <view class="param-list">
          <view class="param-item">
            <text class="label">品牌</text>
            <text class="value">{{product.brand || '暂无'}}</text>
          </view>
          <view class="param-item">
            <text class="label">规格</text>
            <text class="value">{{product.spec || '暂无'}}</text>
          </view>
          <view class="param-item">
            <text class="label">产地</text>
            <text class="value">{{product.origin || '暂无'}}</text>
          </view>
        </view>
      </view>
      
      <!-- 商品详情 -->
      <view class="product-detail mt-card">
        <view class="section-title">
          <text>商品详情</text>
        </view>
        <rich-text :nodes="product.detail || '暂无详细信息'"></rich-text>
      </view>
    </scroll-view>
    
    <!-- 底部操作栏 -->
    <view class="action-bar safe-area-bottom">
      <view class="left">
        <view class="action-item" @click="goCart">
          <text class="iconfont icon-cart"></text>
          <text>购物车</text>
          <text class="mt-badge" v-if="cartCount > 0">{{cartCount}}</text>
        </view>
      </view>
      <view class="right">
        <view class="mt-button plain" @click="addToCart">加入购物车</view>
        <view class="mt-button" @click="buyNow">立即购买</view>
      </view>
    </view>
  </view>
</template>

<script>
import { getProductDetail } from '@/api/product'
import { addToCart, getCartByUserId } from '@/api/cart'
import { getCurrentUser } from '@/api/user'

export default {
  data() {
    return {
      id: null,
      product: null,
      count: 1,
      soldCount: Math.floor(Math.random() * (100 - 20 + 1)) + 20, // 随机生成20-100之间的数字
      cartCount: 0,
      userInfo: null
    }
  },
  
  onLoad(options) {
    if (options.id) {
      this.getDetail(options.id)
    }
  },
  
  onShow() {
    this.checkUserAndLoadCart()
  },
  
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    async getDetail(id) {
      try {
        const res = await getProductDetail(id)
        if (res.code === 1 && res.data) {
          this.product = res.data
        }
      } catch (e) {
        console.error('获取商品详情失败:', e)
        uni.showToast({
          title: '获取商品详情失败',
          icon: 'none'
        })
      }
    },
    
    goCart() {
      uni.switchTab({
        url: '/pages/cart/cart'
      })
    },
    
    // 检查用户登录状态并加载购物车
    async checkUserAndLoadCart() {
      try {
        // 获取当前用户信息
        const userRes = await getCurrentUser()
        if (userRes.code === 1 && userRes.data) {
          this.userInfo = userRes.data
          // 存储用户信息
          uni.setStorageSync('userInfo', userRes.data)
          // 获取购物车数量
          await this.getCartCount()
        }
      } catch (e) {
        console.error('获取用户信息失败:', e)
      }
    },
    
    async addToCart() {
      try {
        // 检查用户是否登录
        if (!this.userInfo) {
          const userRes = await getCurrentUser()
          if (userRes.code === 1 && userRes.data) {
            this.userInfo = userRes.data
            uni.setStorageSync('userInfo', userRes.data)
          } else {
            uni.navigateTo({
              url: '/pages/login/login'
            })
            return
          }
        }

        uni.showLoading({
          title: '添加中'
        })

        const cartData = {
          userId: this.userInfo.id,
          productId: this.product.id,
          quantity: this.count,
          selected: true  // 默认选中
        }

        const res = await addToCart(cartData)
        
        if (res.code === 1) {
          uni.showToast({
            title: '添加成功',
            icon: 'success'
          })
          // 更新购物车数量
          await this.getCartCount()
        } else {
          throw new Error(res.message || '添加失败')
        }
      } catch (e) {
        console.error('添加购物车失败:', e)
        uni.showToast({
          title: e.message || '添加失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    async getCartCount() {
      try {
        if (!this.userInfo) return
        
        const res = await getCartByUserId(this.userInfo.id)
        if (res.code === 1) {
          this.cartCount = res.data.length || 0
        }
      } catch (e) {
        console.error('获取购物车数量失败:', e)
      }
    },
    
    async buyNow() {
      try {
        // 检查用户是否登录
        if (!this.userInfo) {
          const userRes = await getCurrentUser()
          if (userRes.code === 1 && userRes.data) {
            this.userInfo = userRes.data
            uni.setStorageSync('userInfo', userRes.data)
          } else {
            uni.navigateTo({
              url: '/pages/login/login'
            })
            return
          }
        }

        // 构造订单信息
        const orderInfo = {
          products: [{
            id: this.product.id,
            quantity: this.count,
            price: this.product.price,
            name: this.product.name,
            image: this.product.image
          }],
          totalAmount: this.product.price * this.count
        }

        // 跳转到订单创建页面
        uni.navigateTo({
          url: `/pages/order/create?orderInfo=${encodeURIComponent(JSON.stringify(orderInfo))}`
        })
      } catch (e) {
        console.error('立即购买失败:', e)
        uni.showToast({
          title: e.message || '立即购买失败',
          icon: 'none'
        })
      }
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

@keyframes bounce {
  from,
  20%,
  53%,
  to {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translate3d(0, 0, 0);
  }

  40%,
  43% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -30px, 0) scaleY(1.1);
  }

  70% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -15px, 0) scaleY(1.05);
  }

  80% {
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translate3d(0, 0, 0) scaleY(0.95);
  }

  90% {
    transform: translate3d(0, -4px, 0) scaleY(1.02);
  }
}

// 动画类
.animate__animated {
  animation-duration: 0.3s;
  animation-fill-mode: both;
}

.animate__fadeIn {
  animation: fadeIn 0.3s ease both;
}

.animate__fadeInUp {
  animation: fadeInUp 0.3s ease both;
}

.animate__zoomIn {
  animation: zoomIn 0.3s ease both;
}

.animate__bounce {
  animation: bounce 1s ease infinite;
}

.animate__slow {
  animation-duration: 0.5s;
}

.animate__delay-1 {
  animation-delay: 0.1s;
}

.animate__delay-2 {
  animation-delay: 0.2s;
}

.detail-container {
  height: calc(100vh - 88rpx - 100rpx);
  padding-top: calc(88rpx + env(safe-area-inset-top));
  box-sizing: border-box;
}

.product-swiper {
  width: 100%;
  height: 750rpx;
  margin-top: -20rpx;
  
  image {
    width: 100%;
    height: 100%;
    transition: transform 0.3s ease;
    
    &:active {
      transform: scale(0.98);
    }
  }
}

.product-info {
  .price-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20rpx;
    
    .sold {
      font-size: 24rpx;
      color: $text-color-lighter;
      background: rgba(255, 195, 0, 0.1);
      padding: 4rpx 16rpx;
      border-radius: 20rpx;
    }
  }
  
  .name {
    font-size: 32rpx;
    font-weight: bold;
    color: $text-color;
    margin-bottom: 16rpx;
  }
  
  .desc {
    font-size: 28rpx;
    color: $text-color-light;
    line-height: 1.5;
  }
}

.product-params {
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: $text-color;
    margin-bottom: 20rpx;
    padding-left: 20rpx;
    border-left: 8rpx solid $primary-color;
    position: relative;
    overflow: hidden;
    
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -2rpx;
      width: 100%;
      height: 2rpx;
      background: linear-gradient(to right, $primary-color, transparent);
    }
  }
  
  .param-list {
    .param-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f5f5f5;
      transition: all 0.3s ease;
      
      &:active {
        background: #f9f9f9;
      }
      
      &:last-child {
        border-bottom: none;
      }
      
      .label {
        width: 160rpx;
        font-size: 28rpx;
        color: $text-color-light;
      }
      
      .value {
        flex: 1;
        font-size: 28rpx;
        color: $text-color;
      }
    }
  }
}

.product-detail {
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: $text-color;
    margin-bottom: 20rpx;
    padding-left: 20rpx;
    border-left: 8rpx solid $primary-color;
    position: relative;
    overflow: hidden;
    
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -2rpx;
      width: 100%;
      height: 2rpx;
      background: linear-gradient(to right, $primary-color, transparent);
    }
  }
}

.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100rpx;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  animation: fadeInUp 0.3s ease;
  
  .left {
    display: flex;
    align-items: center;
    
    .action-item {
      position: relative;
      text-align: center;
      margin-right: 40rpx;
      transition: all 0.3s ease;
      
      &:active {
        transform: scale(0.9);
      }
      
      .iconfont {
        font-size: 40rpx;
        color: $text-color-light;
      }
      
      text {
        display: block;
        font-size: 20rpx;
        color: $text-color-light;
        margin-top: 4rpx;
      }
      
      .mt-badge {
        animation: bounce 1s ease infinite;
      }
    }
  }
  
  .right {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    
    .mt-button {
      width: 200rpx;
      height: 72rpx;
      line-height: 72rpx;
      margin-left: 20rpx;
      font-size: 28rpx;
      transition: all 0.3s ease;
      
      &:active {
        transform: scale(0.95);
      }
      
      &.plain {
        background: rgba(255, 195, 0, 0.1);
        color: $primary-color;
        border: none;
        
        &:active {
          background: rgba(255, 195, 0, 0.2);
        }
      }
    }
  }
}

.mt-header {
  background: linear-gradient(180deg, #FFD700 0%, #FFC300 100%);
  padding: 20rpx 30rpx;
  padding-top: calc(20rpx + env(safe-area-inset-top));
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}
</style> 