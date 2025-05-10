<template>
  <view class="container">
    <!-- 订单基本信息 -->
    <view class="order-info">
      <view class="info-item">
        <text class="label">订单号：</text>
        <text class="value">{{orderInfo.orderId}}</text>
      </view>
      <view class="info-item">
        <text class="label">下单时间：</text>
        <text class="value">{{orderInfo.createdAt}}</text>
      </view>
      
      <!-- 商品信息 -->
      <view class="product-info">
        <image 
          :src="orderInfo.productImage" 
          mode="aspectFill" 
          class="product-image"
        ></image>
        <view class="product-detail">
          <text class="product-name">{{orderInfo.productName}}</text>
          <text class="product-desc">{{orderInfo.productDesc}}</text>
          <view class="price-info">
            <text>¥{{orderInfo.price}} × {{orderInfo.quantity}}</text>
            <text class="total-price">总计：¥{{orderInfo.totalPrice}}</text>
          </view>
        </view>
      </view>
      
      <!-- 收货信息 -->
      <view class="delivery-info">
        <text class="section-title">收货信息</text>
        <view class="info-content">
          <text>收货人：{{orderInfo.recipientName}}</text>
          <text>联系电话：{{orderInfo.recipientPhone || '无'}}</text>
          <text>收货地址：{{orderInfo.addressDetail}}</text>
        </view>
      </view>
    </view>
    
    <!-- 状态修改部分 -->
    <view class="status-section">
      <text class="section-title">修改订单状态</text>
      <view class="status-list">
        <view 
          v-for="(status, index) in statusList" 
          :key="index"
          :class="['status-item', selectedStatus === status ? 'active' : '']"
          @tap="handleStatusSelect(status)"
        >
          {{status}}
        </view>
      </view>
    </view>
    
    <button class="submit-btn" @tap="handleSubmit">保存修改</button>
  </view>
</template>

<script>
import { updateOrderStatus } from '@/api/order.js'

export default {
  data() {
    return {
      orderInfo: {},
      statusList: ['已付款', '待发货', '已发货', '已完成'],
      selectedStatus: ''
    }
  },
  
  onLoad(options) {
    if (options.orderInfo) {
      this.orderInfo = JSON.parse(decodeURIComponent(options.orderInfo))
      this.selectedStatus = this.orderInfo.orderStatus
    }
  },
  
  methods: {
    handleStatusSelect(status) {
      this.selectedStatus = status
    },
    
    async handleSubmit() {
      if (!this.selectedStatus) {
        uni.showToast({
          title: '请选择订单状态',
          icon: 'none'
        })
        return
      }
      
      if (this.selectedStatus === this.orderInfo.orderStatus) {
        uni.showToast({
          title: '状态未改变',
          icon: 'none'
        })
        return
      }
      
      try {
        const res = await updateOrderStatus(this.orderInfo.orderId, this.selectedStatus)
        
        if (res.code === 1) {
          uni.showToast({
            title: '更新成功',
            icon: 'success'
          })
          setTimeout(() => {
            // 设置上一页需要刷新的标记
            const pages = getCurrentPages()
            const prevPage = pages[pages.length - 2]
            if (prevPage) {
              prevPage.$vm.loadOrders()
            }
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: res.message || '更新失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('更新失败:', error)
        uni.showToast({
          title: '更新失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
}

.order-info {
  background-color: #fff;
  border-radius: 8rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  
  .info-item {
    display: flex;
    margin-bottom: 20rpx;
    
    .label {
      width: 160rpx;
      color: #666;
      font-size: 28rpx;
    }
    
    .value {
      flex: 1;
      color: #333;
      font-size: 28rpx;
    }
  }
}

.product-info {
  display: flex;
  padding: 20rpx 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  
  .product-image {
    width: 160rpx;
    height: 160rpx;
    border-radius: 8rpx;
    margin-right: 20rpx;
  }
  
  .product-detail {
    flex: 1;
    
    .product-name {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 10rpx;
    }
    
    .product-desc {
      font-size: 24rpx;
      color: #666;
      margin-bottom: 10rpx;
    }
    
    .price-info {
      display: flex;
      justify-content: space-between;
      font-size: 24rpx;
      color: #666;
      
      .total-price {
        color: #f00;
      }
    }
  }
}

.delivery-info {
  padding-top: 20rpx;
  
  .section-title {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
    margin-bottom: 20rpx;
  }
  
  .info-content {
    text {
      display: block;
      font-size: 28rpx;
      color: #666;
      margin-bottom: 10rpx;
    }
  }
}

.status-section {
  background-color: #fff;
  border-radius: 8rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  
  .section-title {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
    margin-bottom: 20rpx;
  }
  
  .status-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    
    .status-item {
      padding: 20rpx 40rpx;
      border-radius: 8rpx;
      background-color: #f5f5f5;
      font-size: 28rpx;
      
      &.active {
        background-color: #007AFF;
        color: #fff;
      }
    }
  }
}

.submit-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #007AFF;
  color: #fff;
  border-radius: 8rpx;
  margin-top: 40rpx;
}
</style> 