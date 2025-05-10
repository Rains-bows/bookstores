<template>
  <view class="container">
    <!-- 配送方式 -->
    <view class="delivery-section">
      <text class="section-title">配送方式</text>
      <view class="delivery-options">
        <view 
          class="delivery-item" 
          :class="{ active: deliveryType === 'express' }"
          @click="changeDeliveryType('express')"
        >
          <text class="iconfont icon-express"></text>
          <text>快递配送</text>
        </view>
        <view 
          class="delivery-item" 
          :class="{ active: deliveryType === 'self' }"
          @click="changeDeliveryType('self')"
        >
          <text class="iconfont icon-pickup"></text>
          <text>自提柜自提</text>
        </view>
      </view>
    </view>

    <!-- 地址信息 -->
    <view class="address-card" @click="handleAddressClick" v-if="deliveryType === 'express'">
      <view class="address-info" v-if="selectedAddress">
        <view class="user-info">
          <text class="name">{{ selectedAddress.recipientName }}</text>
          <text class="phone">{{ selectedAddress.phone }}</text>
        </view>
        <view class="address">{{ selectedAddress.address }}</view>
      </view>
      <view class="no-address" v-else>
        <text>请选择收货地址</text>
      </view>
      <text class="iconfont icon-right"></text>
    </view>

    <!-- 自提柜信息 -->
    <view class="address-card" v-else>
      <view class="address-info">
        <view class="user-info">
          <text class="name">自提柜自提</text>
        </view>
        <view class="address">商品将配送至就近的自提柜，请注意查收提货码</view>
      </view>
    </view>

    <!-- 商品信息 -->
    <view class="goods-card">
      <view class="goods-item" v-for="item in orderInfo.products" :key="item.id">
        <image :src="item.image" mode="aspectFill" class="goods-image" @error="handleImageError"/>
        <view class="goods-info">
          <text class="goods-name">{{ item.name }}</text>
          <view class="goods-price-wrap">
            <text class="goods-price">¥{{ item.price }}</text>
            <text class="goods-count">x{{ item.quantity }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 支付方式 -->
    <view class="payment-card">
      <view class="card-title">支付方式</view>
      <view class="payment-options">
        <view 
          class="payment-item"
          v-for="(item, index) in paymentOptions" 
          :key="index"
          :class="{ active: selectedPayment === item.value }"
          @click="selectPayment(item.value)"
        >
          <text class="iconfont" :class="item.icon"></text>
          <text>{{ item.label }}</text>
        </view>
      </view>
    </view>

    <!-- 订单金额 -->
    <view class="amount-card">
      <view class="amount-item">
        <text>商品金额</text>
        <text>¥{{ orderInfo.totalAmount }}</text>
      </view>
      <view class="amount-item total">
        <text>实付款</text>
        <text class="price">¥{{ totalAmount }}</text>
      </view>
    </view>

    <!-- 底部提交栏 -->
    <view class="bottom-bar">
      <view class="total-wrap">
        <text>合计：</text>
        <text class="price">¥{{ totalAmount }}</text>
      </view>
      <button class="submit-btn" @click="submitOrder">提交订单</button>
    </view>
  </view>
</template>

<script>
import { createOrder } from '@/api/order'
import { getCurrentUser } from '@/api/user'
import { getAddressList } from '@/api/address'
import { addAddress } from '@/api/address'
import { createOrderDetail } from '@/api/orderDetail'

export default {
  data() {
    return {
      orderInfo: {
        products: [],
        totalAmount: 0
      },
      paymentOptions: [
        { label: '支付宝', value: 'alipay', icon: 'icon-alipay' },
        { label: '微信支付', value: 'wechat', icon: 'icon-wechat' }
      ],
      selectedPayment: 'alipay',
      userInfo: null,
      deliveryType: 'express', // 配送方式：express-快递, self-自提
      selectedAddress: null,
    }
  },

  computed: {
    totalAmount() {
      return Number(this.orderInfo.totalAmount).toFixed(2)
    }
  },

  onLoad(options) {
    // 解析传入的订单信息
    if (options.orderInfo) {
      try {
        this.orderInfo = JSON.parse(decodeURIComponent(options.orderInfo))
        console.log('接收到的订单信息:', this.orderInfo)
      } catch (e) {
        console.error('解析订单信息失败:', e)
        uni.showToast({
          title: '订单信息错误',
          icon: 'none'
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    }
    
    // 初始化数据
    this.initData()

    // 监听地址选择事件
    uni.$on('addressSelected', this.handleAddressSelected)
  },

  onUnload() {
    // 页面卸载时移除事件监听
    uni.$off('addressSelected', this.handleAddressSelected)
  },

  methods: {
    // 生成唯一订单号
    generateOrderId() {
      const timestamp = new Date().getTime()
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      return `${timestamp}${random}`
    },

    // 初始化数据
    async initData() {
      try {
        // 获取用户信息
        const userRes = await getCurrentUser()
        if (userRes.code === 1 && userRes.data) {
          this.userInfo = userRes.data
          // 如果是外卖配送，获取用户地址列表
          if (this.deliveryType === 'express') {
            await this.loadAddressList()
          }
        } else {
          uni.navigateTo({
            url: '/pages/login/login'
          })
        }
      } catch (e) {
        console.error('初始化数据失败:', e)
      }
    },

    // 加载地址列表
    async loadAddressList() {
      try {
        const addressRes = await getAddressList(this.userInfo.id)
        if (addressRes.code === 1 && addressRes.data?.length > 0) {
          this.selectedAddress = addressRes.data[0]
        }
      } catch (e) {
        console.error('加载地址列表失败:', e)
      }
    },

    // 处理地址点击
    handleAddressClick() {
      if (this.deliveryType === 'express') {
        uni.navigateTo({
          url: '/pages/address/list?select=true'
        })
      }
    },

    // 处理地址选择
    handleAddressSelected(address) {
      if (address) {
        this.selectedAddress = address
        // 添加选择动画
        const addressCard = document.querySelector('.address-card')
        if (addressCard) {
          addressCard.classList.add('address-selected')
          setTimeout(() => {
            addressCard.classList.remove('address-selected')
          }, 500)
        }
      }
    },

    // 选择配送方式
    async changeDeliveryType(type) {
      this.deliveryType = type
      if(type === 'express' && !this.selectedAddress) {
        await this.loadAddressList()
      }
    },

    // 处理图片加载失败
    handleImageError(e) {
      const target = e.target
      if (target) {
        target.src = '/static/images/default-product.png'
      }
    },

    // 选择支付方式
    selectPayment(value) {
      this.selectedPayment = value
    },

    // 提交订单前处理
    async beforeSubmitOrder() {
      if(this.deliveryType === 'self') {
        // 自提柜配送使用固定地址ID 0
        return true
      } else if(this.deliveryType === 'express') {
        // 快递配送必须选择地址
        if(!this.selectedAddress) {
          uni.showToast({
            title: '请选择收货地址',
            icon: 'none'
          })
          return false
        }
      }
      return true
    },

    // 提交订单
    async submitOrder() {
      // 提交订单前的处理
      const canSubmit = await this.beforeSubmitOrder()
      if(!canSubmit) return
      
      // 添加按钮动画效果
      const submitBtn = document.querySelector('.submit-btn')
      if (submitBtn) {
        submitBtn.classList.add('submit-btn-active')
        setTimeout(() => {
          submitBtn.classList.remove('submit-btn-active')
        }, 200)
      }

      try {
        uni.showLoading({
          title: '提交中'
        })

        // 生成订单号
        const orderId = this.generateOrderId()
        const now = new Date()

        // 构造订单数据
        const orderData = {
          id: orderId,
          userId: this.userInfo.id,
          totalAmount: Number(this.totalAmount),
          status: "待付款",
          deliveryType: this.deliveryType,
          paymentMethod: this.selectedPayment,
          createdAt: now,
          updatedAt: now,
          addressId: this.deliveryType === 'self' ? 0 : this.selectedAddress.id // 自提柜使用地址ID 0
        }

        // 创建订单
        const res = await createOrder(orderData)
        if (res.code === 1) {
          // 创建订单详情
          for (const product of this.orderInfo.products) {
            const orderDetailData = {
              orderId: orderId,
              productId: product.id,
              quantity: product.quantity,
              price: product.price,
              userAddressId: this.deliveryType === 'self' ? 0 : this.selectedAddress.id
            }
            
            const detailRes = await createOrderDetail(orderDetailData)
            if (detailRes.code !== 1) {
              throw new Error('创建订单详情失败')
            }
          }

          // 跳转到支付页面，确保微信支付传递wxpay
          uni.redirectTo({
            url: `/pages/payment/index?orderNo=${orderId}&amount=${this.totalAmount}&name=${encodeURIComponent(this.orderInfo.products[0].name)}&payType=${this.selectedPayment === 'wechat' ? 'wxpay' : 'alipay'}`
          })
        } else {
          // 如果创建失败，可能是订单号重复，重新尝试
          if (res.message && res.message.includes('重复')) {
            console.log('订单号重复，重新尝试')
            await this.submitOrder()
            return
          }
          throw new Error(res.message || '创建订单失败')
        }
      } catch (e) {
        console.error('提交订单失败:', e)
        uni.showToast({
          title: e.message || '提交订单失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    }
  }
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.delivery-section {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .section-title {
    font-size: 32rpx;
    color: #333;
    font-weight: bold;
    margin-bottom: 20rpx;
  }
  
  .delivery-options {
    display: flex;
    gap: 20rpx;
    
    .delivery-item {
      flex: 1;
      height: 120rpx;
      background: #f8f8f8;
      border-radius: 12rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      
      &.active {
        background: rgba(254,140,0,0.1);
        border: 2rpx solid #FE8C00;
        
        .iconfont, text {
          color: #FE8C00;
        }
      }
      
      .iconfont {
        font-size: 48rpx;
        color: #666;
        margin-bottom: 8rpx;
      }
      
      text {
        font-size: 26rpx;
        color: #666;
      }
    }
  }
}

.address-card {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent, rgba(255, 68, 68, 0.1), transparent);
    transform: translateX(-100%);
    transition: transform 0.5s ease;
  }
  
  &.address-selected::before {
    transform: translateX(100%);
  }
  
  &:active {
    transform: scale(0.98);
    opacity: 0.8;
  }
  
  .address-info {
    position: relative;
    z-index: 1;
    
    .user-info {
      margin-bottom: 10rpx;
      display: flex;
      align-items: center;
      
      .name {
        font-size: 30rpx;
        color: #333;
        font-weight: bold;
        margin-right: 20rpx;
      }
      
      .phone {
        font-size: 28rpx;
        color: #666;
      }
    }
    
    .address {
      font-size: 28rpx;
      color: #666;
      line-height: 1.4;
    }
  }
  
  .no-address {
    font-size: 28rpx;
    color: #999;
    text-align: center;
    padding: 30rpx 0;
  }
  
  .icon-right {
    position: absolute;
    right: 30rpx;
    top: 50%;
    transform: translateY(-50%);
    font-size: 32rpx;
    color: #999;
  }
}

.goods-card {
  background: #fff;
  padding: 20rpx;
  margin-bottom: 20rpx;
  
  .goods-item {
    display: flex;
    padding: 20rpx 0;
    
    .goods-image {
      width: 160rpx;
      height: 160rpx;
      border-radius: 8rpx;
      margin-right: 20rpx;
    }
    
    .goods-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      
      .goods-name {
        font-size: 28rpx;
        color: #333;
      }
      
      .goods-price-wrap {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .goods-price {
          font-size: 32rpx;
          color: #ff4444;
          font-weight: bold;
        }
        
        .goods-count {
          font-size: 28rpx;
          color: #999;
        }
      }
    }
  }
}

.payment-card {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .card-title {
    font-size: 30rpx;
    color: #333;
    margin-bottom: 20rpx;
  }
}

.payment-options {
  display: flex;
  
  .payment-item {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 20rpx;
    font-size: 28rpx;
    color: #333;
    border: 2rpx solid #eee;
    border-radius: 8rpx;
    margin-right: 20rpx;
    
    &:last-child {
      margin-right: 0;
    }
    
    &.active {
      color: #ff4444;
      border-color: #ff4444;
    }
    
    .iconfont {
      font-size: 40rpx;
      margin-right: 10rpx;
    }
  }
}

.amount-card {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .amount-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    font-size: 28rpx;
    color: #333;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    &.total {
      padding-top: 20rpx;
      border-top: 2rpx solid #f5f5f5;
      
      .price {
        font-size: 36rpx;
        color: #ff4444;
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
  height: 100rpx;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  
  .total-wrap {
    flex: 1;
    font-size: 28rpx;
    
    .price {
      font-size: 36rpx;
      color: #ff4444;
      font-weight: bold;
    }
  }
  
  .submit-btn {
    width: 240rpx;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    background: #ff4444;
    color: #fff;
    font-size: 30rpx;
    border-radius: 40rpx;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      transform: translate(-50%, -50%) scale(0);
      opacity: 0;
      pointer-events: none;
    }
    
    &.submit-btn-active {
      transform: scale(0.95);
      
      &::after {
        animation: ripple 0.6s ease-out;
      }
    }
  }
}

@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

.delivery-item {
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.active {
    animation: select 0.3s ease;
  }
}

@keyframes select {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

.payment-item {
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.active {
    animation: select 0.3s ease;
  }
}
</style>