<template>
  <view class="container">
    <view class="result-card">
      <!-- 状态图标区域 -->
      <view class="status-section">
        <view class="status-icon" :class="{ success: payStatus === 'SUCCESS' }">
          <image 
            :src="'/static/images/' + (payStatus === 'SUCCESS' ? 'success.png' : 'fail.png')" 
            mode="aspectFit"
          />
        </view>
        <view class="status-text" :class="{ success: payStatus === 'SUCCESS' }">
          {{ payStatus === 'SUCCESS' ? '支付成功' : '支付失败' }}
        </view>
        <view class="status-amount">
          <text class="currency">¥</text>
          <text class="amount">{{ orderAmount }}</text>
        </view>
      </view>

      <!-- 取件码区域 - 仅在自提且支付成功时显示 -->
      <view class="pickup-code-section" v-if="payStatus === 'SUCCESS' && isPickupDelivery">
        <view class="pickup-code-title">取件码</view>
        <view class="pickup-code">{{ pickupCode }}</view>
        <view class="pickup-tips">
          <text>请截图保存取件码</text>
          <text>凭此取件码到自提柜取件</text>
        </view>
      </view>

      <!-- 订单信息区域 -->
      <view class="order-info">
        <view class="info-item">
          <text class="label">订单编号</text>
          <text class="value">{{ orderNo }}</text>
        </view>
        <view class="info-item">
          <text class="label">支付方式</text>
          <text class="value">
            <image 
              :src="'/static/images/' + (payType === 'alipay' ? 'alipay-small.png' : 'wxpay-small.png')" 
              mode="aspectFit" 
              class="pay-icon"
            />
            {{ payType === 'alipay' ? '支付宝' : '微信支付' }}
          </text>
        </view>
        <view class="info-item">
          <text class="label">支付时间</text>
          <text class="value">{{ new Date().toLocaleString() }}</text>
        </view>
      </view>

      <!-- 按钮区域 -->
      <view class="actions">
        <button class="btn primary" @click="goToOrderDetail">查看订单</button>
        <button class="btn secondary" @click="goToHome">返回首页</button>
      </view>
    </view>
  </view>
</template>

<script>
import { updateOrder, queryOrder } from '@/api/order'
import { notifyPayment, returnPayment } from '@/api/payment'

export default {
  data() {
    return {
      orderNo: '',
      orderAmount: '',
      payType: '',
      payStatus: '',
      tradeNo: '',
      sign: '',
      loading: false,
      isPickupDelivery: false,
      pickupCode: ''
    }
  },

  onLoad() {
    // 获取URL中的所有参数
    const query = window.location.hash.split('?')[1]
    if (query) {
      const params = new URLSearchParams(query)
      this.orderNo = params.get('out_trade_no') || ''
      this.orderAmount = params.get('money') || ''
      this.payType = params.get('type') || ''
      this.tradeNo = params.get('trade_no') || ''
      this.payStatus = params.get('trade_status') === 'TRADE_SUCCESS' ? 'SUCCESS' : 'FAIL'
      this.sign = params.get('sign') || ''
      
      // 从地址中提取取件码
      const address = params.get('address') || ''
      if (address.includes('自提柜取件码：')) {
        this.isPickupDelivery = true
        this.pickupCode = address.split('自提柜取件码：')[1]
      }
      
      // 如果支付成功且是自提柜配送，显示保存提示
      if (this.payStatus === 'SUCCESS' && this.isPickupDelivery) {
        uni.showModal({
          title: '请保存取件码',
          content: '请截图保存取件码，凭码到自提柜取件',
          showCancel: false,
          confirmText: '我知道了'
        })
      }
      
      // 如果支付成功，发送支付通知
      if (this.payStatus === 'SUCCESS') {
        this.handlePaymentNotify()
      }
    }
  },

  methods: {
    // 处理支付通知
    async handlePaymentNotify() {
      if (this.loading) return
      this.loading = true
      
      try {
        // 从URL中获取所有参数
        const query = window.location.hash.split('?')[1]
        if (!query) {
          throw new Error('未获取到支付参数')
        }

        // 解析URL参数
        const urlParams = new URLSearchParams(query)
        
        // 构造通知参数
        const notifyParams = {
          pid: urlParams.get('pid'),
          trade_no: urlParams.get('trade_no'),
          out_trade_no: urlParams.get('out_trade_no'),
          type: urlParams.get('type'),
          name: urlParams.get('name'),
          money: urlParams.get('money'),
          trade_status: urlParams.get('trade_status'),
          sign: urlParams.get('sign'),
          sign_type: urlParams.get('sign_type'),
          timestamp: urlParams.get('timestamp'),
          charset: urlParams.get('charset'),
          version: urlParams.get('version')
        }
        
        // 过滤掉空值
        Object.keys(notifyParams).forEach(key => {
          if (!notifyParams[key]) {
            delete notifyParams[key]
          }
        })
        
        console.log('通知参数:', notifyParams)
        
        // 验证必要参数
        if (!notifyParams.out_trade_no || !notifyParams.trade_no || !notifyParams.sign) {
          throw new Error('缺少必要的支付参数')
        }
        
        // 发送异步通知
        const notifyRes = await notifyPayment(notifyParams)
        console.log('支付异步通知结果:', notifyRes)
        
        // 同时发送同步通知
        const returnRes = await returnPayment(notifyParams)
        console.log('支付同步通知结果:', returnRes)
        
        // 查询订单状态
        const queryRes = await queryOrder(notifyParams.out_trade_no)
        console.log('查询订单状态结果:', queryRes)
        
        if (queryRes.code === 1 && queryRes.data) {
          // 根据返回的status判断支付状态
          const isPaySuccess = queryRes.data.trade_status === 'TRADE_SUCCESS' || 
                             queryRes.data.status === '1' || 
                             queryRes.data.status === 1
          
          this.payStatus = isPaySuccess ? 'SUCCESS' : 'FAIL'
          
          if (isPaySuccess) {
            // 支付成功，更新订单状态
            const updateData = {
              status: '已付款',
              payTime: new Date().toISOString(),
              payType: notifyParams.type,
              tradeNo: notifyParams.trade_no,
              payAmount: notifyParams.money,
              payStatus: 'SUCCESS'
            }
            
            const updateRes = await updateOrder(notifyParams.out_trade_no, updateData)
            
            if (updateRes.code !== 1) {
              console.error('更新订单状态失败:', updateRes.message)
              uni.showToast({
                title: '更新订单状态失败',
                icon: 'none'
              })
            } else {
              uni.showToast({
                title: '支付成功',
                icon: 'success'
              })
            }
          } else {
            uni.showToast({
              title: '支付失败',
              icon: 'none'
            })
          }
        } else {
          throw new Error(queryRes.message || '查询订单状态失败')
        }
      } catch (e) {
        console.error('处理支付通知失败:', e)
        uni.showToast({
          title: e.message || '处理支付通知失败',
          icon: 'none'
        })
        // 设置支付状态为失败
        this.payStatus = 'FAIL'
      } finally {
        this.loading = false
      }
    },

    goToOrderDetail() {
      // 使用reLaunch替代redirectTo，这样可以清除导航栈
      uni.reLaunch({
        url: '/pages/order/list'
      })
    },
    
    goToHome() {
      // 使用reLaunch替代switchTab，确保清除导航栈
      uni.reLaunch({
        url: '/pages/mall/mall'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f7f7f7;
  padding: 32rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-card {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  width: 100%;
  max-width: 686rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.05);
}

.status-section {
  text-align: center;
  padding: 32rpx 0 48rpx;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 2rpx;
    background: linear-gradient(to right, transparent, #f0f0f0, transparent);
  }
  
  .status-icon {
    margin-bottom: 24rpx;
    
    image {
      width: 128rpx;
      height: 128rpx;
      transition: transform 0.3s ease;
    }
    
    &.success image {
      animation: bounce 0.5s ease;
    }
  }
  
  .status-text {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;
    
    &.success {
      color: #52c41a;
    }
  }
  
  .status-amount {
    margin-top: 32rpx;
    
    .currency {
      font-size: 36rpx;
      color: #333;
      margin-right: 8rpx;
    }
    
    .amount {
      font-size: 48rpx;
      font-weight: bold;
      color: #333;
    }
  }
}

.order-info {
  padding: 48rpx 32rpx;
  background: #fafafa;
  border-radius: 16rpx;
  margin: 32rpx 0;
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      color: #999;
      font-size: 28rpx;
    }
    
    .value {
      color: #333;
      font-size: 28rpx;
      font-weight: 500;
      display: flex;
      align-items: center;
      
      .pay-icon {
        width: 32rpx;
        height: 32rpx;
        margin-right: 8rpx;
      }
    }
  }
}

.actions {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  margin-top: 48rpx;
  
  .btn {
    min-width: 240rpx;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 44rpx;
    font-size: 30rpx;
    font-weight: 500;
    transition: all 0.3s ease;
    
    &.primary {
      background: linear-gradient(135deg, #ff6633, #ff4d4d);
      color: #fff;
      box-shadow: 0 8rpx 16rpx rgba(255, 102, 51, 0.2);
      
      &:active {
        transform: translateY(2rpx);
        box-shadow: 0 4rpx 8rpx rgba(255, 102, 51, 0.2);
      }
    }
    
    &.secondary {
      background: #f5f5f5;
      color: #666;
      border: 2rpx solid #e5e5e5;
      
      &:active {
        background: #f0f0f0;
      }
    }
  }
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.pickup-code-section {
  text-align: center;
  padding: 40rpx;
  margin: 30rpx 0;
  background: rgba(254,140,0,0.05);
  border-radius: 20rpx;
  
  .pickup-code-title {
    font-size: 32rpx;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .pickup-code {
    font-size: 60rpx;
    color: #FE8C00;
    font-weight: bold;
    letter-spacing: 4rpx;
    margin: 20rpx 0;
    text-shadow: 0 2rpx 4rpx rgba(254,140,0,0.2);
  }
  
  .pickup-tips {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10rpx;
    margin-top: 20rpx;
    
    text {
      font-size: 26rpx;
      color: #666;
      
      &:first-child {
        color: #FE8C00;
        font-weight: 500;
      }
    }
  }
}
</style> 