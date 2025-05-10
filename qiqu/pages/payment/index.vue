<template>
  <view class="container">
    <!-- 订单信息 -->
    <view class="order-info">
      <view class="amount">
        <text class="label">支付金额</text>
        <text class="value">¥{{ orderAmount }}</text>
      </view>
      <view class="order-no">
        <text class="label">订单编号</text>
        <text class="value">{{ orderNo }}</text>
      </view>
    </view>
    
    <!-- 支付方式 - 简化版 -->
    <view class="payment-methods">
      <view class="method-tabs">
        <view 
          class="tab-item"
          :class="{ active: selectedMethod === 'wxpay' }"
          @click="quickSelect('wxpay')"
        >
          <image src="/static/images/wxpay.png" mode="aspectFit" class="icon"/>
          <text>微信支付</text>
        </view>
        <view 
          class="tab-item"
          :class="{ active: selectedMethod === 'alipay' }"
          @click="quickSelect('alipay')"
        >
          <image src="/static/images/alipay.png" mode="aspectFit" class="icon"/>
          <text>支付宝支付</text>
        </view>
      </view>
    </view>

    <!-- 支付二维码 -->
    <view class="qr-section" v-if="qrCodeUrl">
      <view class="qr-wrapper">
        <image :src="qrCodeUrl" mode="aspectFit" class="qr-image"/>
        <view class="qr-tips">
          <text class="main-tip">请使用{{ selectedMethod === 'wxpay' ? '微信' : '支付宝' }}扫码支付</text>
          <text class="amount">¥{{ orderAmount }}</text>
          <text class="sub-tip" v-if="countdown > 0">{{ countdown }}秒后刷新支付状态</text>
        </view>
      </view>
    </view>
    
    <!-- 支付状态 -->
    <view class="status-section" v-if="currentStatus">
      <text class="status-text">{{ currentStatus }}</text>
    </view>
  </view>
</template>

<script>
import { getPayLink, queryOrder, createPayOrder } from '@/api/payment'
import QRCode from 'qrcode'

export default {
  data() {
    return {
      orderNo: '',
      orderAmount: '',
      orderName: '',
      selectedMethod: 'alipay',
      paymentMethods: [
        {
          id: 'wxpay',
          name: '微信支付',
          icon: 'images/wxpay.png'
        },
        {
          id: 'alipay',
          name: '支付宝支付',
          icon: 'images/alipay.png'
        }
      ],
      showStatus: false,
      currentStatus: '等待支付',
      payUrl: '',
      queryCount: 0,
      maxQueryCount: 60,
      queryInterval: 3000,
      payTimer: null,
      paymentSuccess: false,
      countdown: 0,
      countdownTimer: null,
      qrCodeUrl: '',
      payForm: '',
      usedOrderNos: new Set(), // 用于存储已使用的订单号
    }
  },

  onLoad(options) {
    if(options.orderNo && options.amount) {
      this.orderNo = options.orderNo;
      this.orderAmount = options.amount;
      this.orderName = decodeURIComponent(options.name || '');
      // 设置支付方式并直接发起支付
      this.selectedMethod = options.payType || 'alipay';
      console.log('选择的支付方式:', this.selectedMethod, '原始payType:', options.payType);
      // 直接发起支付
      this.$nextTick(() => {
        this.handlePay();
      });
    } else {
      uni.showToast({
        title: '订单信息错误',
        icon: 'none'
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  },

  onUnload() {
    this.stopQueryPayStatus()
  },

  methods: {
    // 生成新的订单号
    generateNewOrderNo() {
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return timestamp + random;
    },

    // 检查订单号是否已使用并获取新订单号
    getValidOrderNo() {
      if (!this.usedOrderNos.has(this.orderNo)) {
        this.usedOrderNos.add(this.orderNo);
        return this.orderNo;
      }
      // 如果订单号已使用，生成新的订单号
      const newOrderNo = this.generateNewOrderNo();
      this.usedOrderNos.add(newOrderNo);
      uni.showToast({
        title: '已重新生成订单号',
        icon: 'none'
      });
      return newOrderNo;
    },

    // 快速选择支付方式并立即发起支付
    quickSelect(method) {
      if (this.selectedMethod === method) return;
      this.selectedMethod = method;
      // 清除之前的二维码
      this.qrCodeUrl = '';
      // 重置状态
      this.currentStatus = '等待支付';
      // 发起新的支付
      this.handlePay();
    },
    
    // 提交支付
    async handlePay() {
      try {
        uni.showLoading({
          title: '提交中'
        })
        
        // 获取有效的订单号
        const validOrderNo = this.getValidOrderNo();
        
        const params = {
          pid: "189092420",
          out_trade_no: validOrderNo,
          type: this.selectedMethod === 'wxpay' ? 'wxpay' : 'alipay',  // 确保微信支付传递wxpay
          notify_url: window.location.origin + "/api/epay/notify",
          return_url: window.location.origin + "/#/pages/payment/result",
          name: this.orderName || "商品订单",
          money: Number(this.orderAmount).toFixed(2),
          sitename: "情趣优选"
        }
        
        const res = await getPayLink(params)
        
        uni.hideLoading()
        
        if(res.code === 1 && res.data) {
          // 如果是扫码支付，解析二维码
          if(res.data.includes('<div class="qrcode">')) {
            this.parseQrCode(res.data)
            // 设置对应的支付提示
            this.currentStatus = `请使用${this.selectedMethod === 'wxpay' ? '微信' : '支付宝'}扫码支付`;
          } else {
            // 直接跳转支付
            window.location.href = res.data
          }
          
          // 开始轮询支付状态
          this.startQueryPayStatus()
        } else {
          throw new Error(res.message || '支付失败')
        }
      } catch(e) {
        uni.hideLoading()
        console.error('支付失败:', e)
        uni.showToast({
          title: e.message || '支付失败',
          icon: 'none'
        })
      }
    },

    // 开始查询支付状态
    startQueryPayStatus() {
      if (!this.orderNo) return
      this.queryCount = 0
      this.queryPayStatus()
    },

    // 查询支付状态
    async queryPayStatus() {
      try {
        const result = await queryOrder(this.orderNo)
        console.log('支付状态查询结果:', result)
        
        if (result.code === 1 && result.data) {
          // 获取订单状态
          const orderStatus = result.data.status
          
          if (orderStatus === 'SUCCESS' || orderStatus === '已支付') {
            // 支付成功
            this.paymentSuccess = true
            this.stopQueryPayStatus()
            this.currentStatus = '支付成功！正在跳转...'
            // 延迟跳转到支付结果页
            setTimeout(() => {
              uni.redirectTo({
                url: `/pages/payment/result?orderNo=${this.orderNo}&amount=${this.orderAmount}&payType=${this.selectedMethod}&fromPayment=true`
              })
            }, 1500)
          } else {
            // 订单未支付，继续查询
            this.queryCount++
            if (this.queryCount < this.maxQueryCount) {
              this.payTimer = setTimeout(() => {
                this.queryPayStatus()
              }, this.queryInterval)
            } else {
              this.stopQueryPayStatus()
              this.currentStatus = '支付超时，请重新发起支付'
            }
          }
        }
      } catch(e) {
        console.error('查询支付状态失败:', e)
        this.queryCount++
        if (this.queryCount < this.maxQueryCount) {
          this.payTimer = setTimeout(() => {
            this.queryPayStatus()
          }, this.queryInterval)
        } else {
          this.stopQueryPayStatus()
          this.currentStatus = '查询支付状态失败，请刷新页面重试'
        }
      }
    },

    // 停止查询
    stopQueryPayStatus() {
      this.stopCountdown() // 停止倒计时
      if (this.payTimer) {
        clearTimeout(this.payTimer)
        this.payTimer = null
      }
    },

    // 开始倒计时
    startCountdown() {
      this.stopCountdown()
      this.countdown = Math.floor(this.queryInterval / 1000)
      this.countdownTimer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--
        } else {
          this.stopCountdown()
        }
      }, 1000)
    },

    // 停止倒计时
    stopCountdown() {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }
      this.countdown = 0
    },

    // 返回
    goBack() {
      // 检查是否支付成功
      if (this.paymentSuccess) {
        uni.redirectTo({
          url: '/pages/order/list'
        })
      } else {
        uni.navigateBack({
          delta: 1
        })
      }
    },

    onBeforeUnmount() {
      this.stopQueryPayStatus()
    },

    // 显示支付表单
    showPayForm() {
      if(this.payForm) {
        // 创建一个临时div来解析HTML
        const div = document.createElement('div');
        div.innerHTML = this.payForm;
        
        // 获取支付二维码图片URL
        const qrImage = div.querySelector('img');
        if(qrImage && qrImage.src) {
          this.qrCodeUrl = qrImage.src;
          this.showStatus = true;
          this.currentStatus = `请使用${this.selectedMethod === 'wxpay' ? '微信' : '支付宝'}扫码完成支付`;
          this.startQueryPayStatus();
        } else {
          uni.showToast({
            title: '获取支付二维码失败',
            icon: 'none'
          });
        }
      }
    },
  }
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 30rpx;
}

.order-info {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
  
  .amount {
    text-align: center;
    margin-bottom: 30rpx;
    
    .label {
      font-size: 32rpx;
      color: #666;
      margin-bottom: 20rpx;
      display: block;
    }
    
    .value {
      font-size: 72rpx;
      color: #FF4444;
      font-weight: bold;
    }
  }
  
  .order-no {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 28rpx;
    color: #999;
    
    .value {
      color: #666;
    }
  }
}

.payment-methods {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
  
  .method-tabs {
    display: flex;
    justify-content: space-around;
    
    .tab-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30rpx;
      border-radius: 16rpx;
      transition: all 0.3s;
      
      &.active {
        background: rgba(254,140,0,0.1);
        
        text {
          color: #FE8C00;
        }
      }
      
      .icon {
        width: 80rpx;
        height: 80rpx;
        margin-bottom: 16rpx;
      }
      
      text {
        font-size: 28rpx;
        color: #666;
      }
    }
  }
}

.qr-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
  
  .qr-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .qr-image {
      width: 400rpx;
      height: 400rpx;
      margin: 20rpx 0;
    }
    
    .qr-tips {
      text-align: center;
      
      .main-tip {
        font-size: 32rpx;
        color: #333;
        margin-bottom: 16rpx;
        display: block;
      }
      
      .amount {
        font-size: 48rpx;
        color: #FF4444;
        font-weight: bold;
        margin: 20rpx 0;
        display: block;
      }
      
      .sub-tip {
        font-size: 24rpx;
        color: #999;
        display: block;
      }
    }
  }
}

.status-section {
  text-align: center;
  padding: 30rpx;
  
  .status-text {
    font-size: 28rpx;
    color: #666;
  }
}
</style> 