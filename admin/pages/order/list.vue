<template>
  <view class="container">
    <!-- 订单统计卡片 -->
    <view class="statistics-card">
      <view class="stat-item">
        <text class="stat-value">{{orderStats.todayCount}}</text>
        <text class="stat-label">今日订单</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">¥{{orderStats.todayAmount}}</text>
        <text class="stat-label">今日金额</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{orderStats.totalCount}}</text>
        <text class="stat-label">总订单</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">¥{{orderStats.totalAmount}}</text>
        <text class="stat-label">总金额</text>
      </view>
    </view>
    
    <!-- 状态筛选 -->
    <view class="status-filter">
      <view 
        v-for="(status, index) in statusList" 
        :key="index"
        :class="['status-item', currentStatus === status ? 'active' : '']"
        @tap="handleStatusChange(status)"
      >
        {{status}}
      </view>
    </view>
    
    <!-- 日期选择 -->
    <view class="date-filter">
      <picker 
        mode="date" 
        :value="startDate" 
        :end="endDate"
        @change="onStartDateChange"
      >
        <view class="picker-item">
          <text>开始日期：{{startDate}}</text>
        </view>
      </picker>
      <text>至</text>
      <picker 
        mode="date" 
        :value="endDate" 
        :start="startDate"
        :end="currentDate"
        @change="onEndDateChange"
      >
        <view class="picker-item">
          <text>结束日期：{{endDate}}</text>
        </view>
      </picker>
    </view>
    
    <!-- 订单列表 -->
    <view class="order-list">
      <view v-for="item in filteredOrders" :key="item.id" class="order-item">
        <view class="order-header">
          <text class="order-id">订单号：{{item.orderId}}</text>
          <text class="order-status">{{item.orderStatus}}</text>
        </view>
        
        <view class="order-content">
          <image 
            :src="item.productImage" 
            mode="aspectFill" 
            class="product-image"
          ></image>
          <view class="order-info">
            <text class="product-name">{{item.productName}}</text>
            <text class="product-desc">{{item.productDesc}}</text>
            <view class="price-info">
              <text>¥{{item.price}} × {{item.quantity}}</text>
              <text class="total-price">总计：¥{{item.totalPrice}}</text>
            </view>
          </view>
        </view>
        
        <view class="delivery-info">
          <text>收货人：{{item.recipientName}}</text>
          <text>联系电话：{{item.recipientPhone || '无'}}</text>
          <text>收货地址：{{item.addressDetail}}</text>
        </view>
        
        <view class="order-footer">
          <text class="order-time">下单时间：{{formatTime(item.createdAt)}}</text>
          <button 
            class="action-btn"
            @tap="handleEdit(item)"
          >修改状态</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getAllOrderDetails } from '@/api/order.js'

export default {
  data() {
    return {
      allOrders: [],
      statusList: ['已付款', '待发货', '已发货', '已完成'],
      currentStatus: '',
      startDate: '',
      endDate: '',
      currentDate: '',
      orderStats: {
        todayCount: 0,
        todayAmount: 0,
        totalCount: 0,
        totalAmount: '0.00'
      }
    }
  },
  
  computed: {
    filteredOrders() {
      return this.allOrders
        .filter(order => !this.currentStatus || order.orderStatus === this.currentStatus)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    },
    
    currentStats() {
      const today = new Date().toISOString().split('T')[0]
      const filteredOrders = this.filteredOrders
      const todayOrders = filteredOrders.filter(order => 
        new Date(order.createdAt).toISOString().split('T')[0] === today
      )
      
      return {
        todayCount: todayOrders.length,
        todayAmount: todayOrders.reduce((sum, order) => sum + Number(order.totalPrice), 0).toFixed(2),
        totalCount: filteredOrders.length,
        totalAmount: filteredOrders.reduce((sum, order) => sum + Number(order.totalPrice), 0).toFixed(2)
      }
    }
  },
  
  created() {
    // 初始化日期
    const now = new Date()
    this.currentDate = this.formatDate(now)
    // 默认显示最近7天的订单
    this.endDate = this.currentDate
    this.startDate = this.formatDate(new Date(now.setDate(now.getDate() - 7)))
  },
  
  onLoad() {
    this.loadOrders()
  },
  
  onShow() {
    this.loadOrders()
  },
  
  methods: {
    async loadOrders() {
      try {
        const res = await getAllOrderDetails()
        if (res.code === 1) {
          this.allOrders = res.data
          this.orderStats = this.currentStats
          console.log('订单数据已刷新')
        }
      } catch (error) {
        console.error('获取订单列表失败:', error)
        uni.showToast({
          title: '获取订单列表失败',
          icon: 'none'
        })
      }
    },
    
    handleStatusChange(status) {
      this.currentStatus = status
      this.orderStats = this.currentStats
    },
    
    onStartDateChange(e) {
      this.startDate = e.detail.value
      this.orderStats = this.currentStats
    },
    
    onEndDateChange(e) {
      this.endDate = e.detail.value
      this.orderStats = this.currentStats
    },
    
    formatDate(date) {
      return date.toISOString().split('T')[0]
    },
    
    formatTime(timestamp) {
      if (!timestamp) return ''
      return timestamp
    },
    
    handleEdit(item) {
      uni.navigateTo({
        url: `/pages/order/edit?orderInfo=${encodeURIComponent(JSON.stringify(item))}`
      })
    }
  },
  
  // 监听筛选条件变化，更新统计数据
  watch: {
    currentStatus() {
      this.orderStats = this.currentStats
    },
    startDate() {
      this.orderStats = this.currentStats
    },
    endDate() {
      this.orderStats = this.currentStats
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
}

.statistics-card {
  background-color: #fff;
  border-radius: 8rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
  
  .stat-item {
    text-align: center;
    
    .stat-value {
      font-size: 36rpx;
      color: #007AFF;
      font-weight: bold;
      display: block;
    }
    
    .stat-label {
      font-size: 24rpx;
      color: #666;
      margin-top: 10rpx;
    }
  }
}

.date-filter {
  background-color: #fff;
  padding: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .picker-item {
    padding: 10rpx 20rpx;
    border: 1px solid #ddd;
    border-radius: 4rpx;
    font-size: 28rpx;
  }
}

.status-filter {
  display: flex;
  overflow-x: auto;
  margin-bottom: 20rpx;
  background-color: #fff;
  padding: 20rpx;
  
  .status-item {
    padding: 10rpx 30rpx;
    margin-right: 20rpx;
    border-radius: 30rpx;
    font-size: 28rpx;
    background-color: #f5f5f5;
    white-space: nowrap;
    
    &.active {
      background-color: #007AFF;
      color: #fff;
    }
  }
}

.order-list {
  .order-item {
    background-color: #fff;
    border-radius: 8rpx;
    padding: 20rpx;
    margin-bottom: 20rpx;
    
    .order-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20rpx;
      
      .order-id {
        font-size: 28rpx;
        color: #666;
      }
      
      .order-status {
        font-size: 28rpx;
        color: #007AFF;
      }
    }
    
    .order-content {
      display: flex;
      align-items: center;
      
      .product-image {
        width: 160rpx;
        height: 160rpx;
        border-radius: 8rpx;
        margin-right: 20rpx;
      }
      
      .order-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 10rpx;
        font-size: 28rpx;
        color: #666;
        
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
      margin: 20rpx 0;
      padding: 20rpx;
      background-color: #f8f8f8;
      border-radius: 8rpx;
      font-size: 24rpx;
      color: #666;
      
      text {
        display: block;
        margin-bottom: 10rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
    
    .order-footer {
      margin-top: 20rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .order-time {
        font-size: 28rpx;
        color: #666;
      }
      
      .action-btn {
        font-size: 28rpx;
        padding: 10rpx 30rpx;
        background-color: #007AFF;
        color: #fff;
        border-radius: 30rpx;
      }
    }
  }
}

.product-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
}

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

.delivery-info {
  margin: 20rpx 0;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #666;
  
  text {
    display: block;
    margin-bottom: 10rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style> 