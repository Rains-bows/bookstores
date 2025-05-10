<template>
  <view class="container">
    <!-- 订单状态 -->
    <view class="status-card">
      <view class="status">{{ orderStatusText }}</view>
      <view class="time">下单时间：{{ orderInfo.createTime }}</view>
    </view>

    <!-- 收货信息 -->
    <view class="info-card" v-if="orderInfo.deliveryType === 'delivery'">
      <view class="card-title">
        <text class="iconfont icon-location"></text>
        <text>收货信息</text>
      </view>
      <view class="address-info">
        <view class="user">
          <text class="name">{{ orderInfo.address?.recipient_name }}</text>
          <text class="phone">{{ orderInfo.address?.phone }}</text>
        </view>
        <view class="address">{{ orderInfo.address?.address }}</view>
      </view>
    </view>

    <!-- 自提信息 -->
    <view class="info-card" v-else>
      <view class="card-title">
        <text class="iconfont icon-store"></text>
        <text>自提信息</text>
      </view>
      <view class="store-info">
        <view class="store-name">{{ orderInfo.store?.name }}</view>
        <view class="store-address">{{ orderInfo.store?.address }}</view>
        <view class="store-time">营业时间：24小时</view>
      </view>
    </view>

    <!-- 商品信息 -->
    <view class="info-card">
      <view class="card-title">
        <text class="iconfont icon-goods"></text>
        <text>商品信息</text>
      </view>
      <view class="product-list">
        <view class="product-item" v-for="item in orderInfo.products" :key="item.id">
          <image :src="item.image" mode="aspectFill" class="product-img"/>
          <view class="product-info">
            <view class="name">{{ item.name }}</view>
            <view class="price-qty">
              <text class="price">￥{{ item.price }}</text>
              <text class="qty">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="info-card">
      <view class="card-title">
        <text class="iconfont icon-order"></text>
        <text>订单信息</text>
      </view>
      <view class="order-info">
        <view class="info-item">
          <text class="label">订单编号</text>
          <text class="value">{{ orderInfo.id }}</text>
        </view>
        <view class="info-item">
          <text class="label">配送方式</text>
          <text class="value">{{ orderInfo.deliveryType === 'delivery' ? '外卖配送' : '自提' }}</text>
        </view>
        <view class="info-item">
          <text class="label">支付方式</text>
          <text class="value">{{ orderInfo.paymentMethod || '在线支付' }}</text>
        </view>
      </view>
    </view>

    <!-- 金额信息 -->
    <view class="info-card">
      <view class="amount-info">
        <view class="amount-item">
          <text>商品总额</text>
          <text>￥{{ orderInfo.totalAmount }}</text>
        </view>
        <view class="amount-item">
          <text>配送费</text>
          <text>{{ orderInfo.deliveryType === 'delivery' ? `￥${orderInfo.freight}` : '免配送费' }}</text>
        </view>
        <view class="amount-item total">
          <text>实付款</text>
          <text class="price">￥{{ calculateTotal() }}</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <block v-if="orderInfo.status === 0">
        <button class="btn" @click="cancelOrder">取消订单</button>
        <button class="btn primary" @click="payOrder">立即支付</button>
      </block>
      <block v-else-if="orderInfo.status === 1">
        <button class="btn" @click="deleteOrder">删除订单</button>
        <button class="btn primary" @click="confirmReceive">确认收货</button>
      </block>
      <block v-else>
        <button class="btn" @click="deleteOrder">删除订单</button>
        <button class="btn primary" @click="buyAgain">再次购买</button>
      </block>
    </view>
  </view>
</template>

<script>
import { queryOrder } from '@/api/order'
import { getPayLink, createPayOrder } from '@/api/payment'

export default {
  data() {
    return {
      orderId: '',
      orderInfo: {
        id: '',
        status: 0,
        createTime: '',
        deliveryType: 'delivery',
        address: null,
        store: null,
        products: [],
        totalAmount: 0,
        freight: 0,
        paymentMethod: ''
      }
    }
  },

  computed: {
    orderStatusText() {
      const statusMap = {
        0: '待支付',
        1: '待收货',
        2: '已完成',
        3: '已取消'
      }
      return statusMap[this.orderInfo.status] || '未知状态'
    }
  },

  onLoad(options) {
    if (options.orderId) {
      this.orderId = options.orderId
      this.loadOrderDetail()
    }
  },

  methods: {
    // 加载订单详情
    async loadOrderDetail() {
      try {
        const res = await queryOrder(this.orderId)
        if (res.code === 1 && res.data) {
          this.orderInfo = res.data
        } else {
          uni.showToast({
            title: '获取订单详情失败',
            icon: 'none'
          })
        }
      } catch (e) {
        console.error('加载订单详情失败:', e)
        uni.showToast({
          title: '加载订单详情失败',
          icon: 'none'
        })
      }
    },

    // 计算总金额
    calculateTotal() {
      return (Number(this.orderInfo.totalAmount) + Number(this.orderInfo.freight)).toFixed(2)
    },

    // 支付订单
    async payOrder() {
      try {
        // 构造支付参数
        const payParams = {
          pid: "164878717",
          type: "alipay",
          out_trade_no: this.orderInfo.id,
          notify_url: "/epay/notify",
          return_url: "/epay/return",
          name: this.orderInfo.products[0]?.name || "商品订单",
          money: this.calculateTotal(),
          sitename: "情趣商城"
        }

        // 先创建支付订单
        const createRes = await createPayOrder(payParams)
        if (createRes.code !== 1) {
          throw new Error(createRes.message || '创建支付订单失败')
        }

        // 获取支付链接
        const res = await getPayLink(payParams)
        if (res.code === 1) {
          // 在新窗口打开支付链接
          window.open(res.data)
          // 跳转到支付结果页面
          uni.navigateTo({
            url: `/pages/payment/result?orderId=${this.orderInfo.id}&amount=${this.calculateTotal()}`
          })
        } else {
          throw new Error(res.message || '获取支付链接失败')
        }
      } catch (e) {
        console.error('发起支付失败:', e)
        uni.showToast({
          title: e.message || '发起支付失败',
          icon: 'none'
        })
      }
    },

    // 取消订单
    cancelOrder() {
      uni.showModal({
        title: '提示',
        content: '确定要取消订单吗？',
        success: async (res) => {
          if (res.confirm) {
            // TODO: 调用取消订单接口
          }
        }
      })
    },

    // 确认收货
    confirmReceive() {
      uni.showModal({
        title: '提示',
        content: '确认已收到商品？',
        success: async (res) => {
          if (res.confirm) {
            // TODO: 调用确认收货接口
          }
        }
      })
    },

    // 删除订单
    deleteOrder() {
      uni.showModal({
        title: '提示',
        content: '确定要删除订单吗？',
        success: async (res) => {
          if (res.confirm) {
            // TODO: 调用删除订单接口
          }
        }
      })
    },

    // 再次购买
    buyAgain() {
      // TODO: 实现再次购买逻辑
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/meituan.scss';

.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.status-card {
  background: $mt-primary;
  color: #fff;
  padding: 40rpx 30rpx;
  
  .status {
    font-size: 36rpx;
    font-weight: bold;
    margin-bottom: 10rpx;
  }
  
  .time {
    font-size: 24rpx;
    opacity: 0.8;
  }
}

.info-card {
  background: #fff;
  margin-top: 20rpx;
  padding: 30rpx;
  
  .card-title {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    font-size: 30rpx;
    color: #333;
    
    .iconfont {
      font-size: 36rpx;
      margin-right: 10rpx;
      color: $mt-primary;
    }
  }
}

.address-info, .store-info {
  .user {
    margin-bottom: 10rpx;
    
    .name {
      font-size: 30rpx;
      margin-right: 20rpx;
    }
    
    .phone {
      font-size: 28rpx;
      color: #666;
    }
  }
  
  .address {
    font-size: 28rpx;
    color: #333;
    line-height: 1.4;
  }
}

.store-info {
  .store-name {
    font-size: 30rpx;
    margin-bottom: 10rpx;
  }
  
  .store-address, .store-time {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 10rpx;
  }
}

.product-list {
  .product-item {
    display: flex;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .product-img {
      width: 160rpx;
      height: 160rpx;
      border-radius: 8rpx;
      margin-right: 20rpx;
    }
    
    .product-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      
      .name {
        font-size: 28rpx;
        color: #333;
      }
      
      .price-qty {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .price {
          font-size: 32rpx;
          color: #FF4444;
          font-weight: bold;
        }
        
        .qty {
          font-size: 28rpx;
          color: #999;
        }
      }
    }
  }
}

.order-info {
  .info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;
    font-size: 28rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      color: #666;
    }
    
    .value {
      color: #333;
    }
  }
}

.amount-info {
  .amount-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;
    font-size: 28rpx;
    color: #666;
    
    &.total {
      margin-top: 30rpx;
      padding-top: 20rpx;
      border-top: 1rpx solid #f5f5f5;
      font-size: 30rpx;
      color: #333;
      
      .price {
        color: #FF4444;
        font-weight: bold;
      }
    }
  }
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  padding: 20rpx 30rpx;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  
  .btn {
    width: 180rpx;
    height: 72rpx;
    line-height: 72rpx;
    border-radius: 36rpx;
    font-size: 28rpx;
    margin-left: 20rpx;
    
    &.primary {
      background: $mt-primary;
      color: #fff;
      
      &:active {
        opacity: 0.9;
      }
    }
    
    &:not(.primary) {
      background: #f5f5f5;
      color: #666;
      
      &:active {
        background: #eee;
      }
    }
  }
}
</style> 