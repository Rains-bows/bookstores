<template>
  <div class="payment-container">
    <!-- 商品信息展示 -->
    <div class="product-info">
      <h2>{{ product.name }}</h2>
      <p>价格: ¥{{ product.price }}</p>
    </div>

    <!-- 支付方式选择 -->
    <div class="payment-methods">
      <h3>选择支付方式</h3>
      <div class="method-list">
        <label v-for="method in paymentMethods" :key="method.value">
          <input 
            type="radio" 
            v-model="selectedMethod" 
            :value="method.value"
          >
          {{ method.label }}
        </label>
      </div>
    </div>

    <!-- 支付按钮 -->
    <button 
      class="pay-button" 
      @click="createPayment" 
      :disabled="!selectedMethod"
    >
      立即支付
    </button>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import axios from 'axios'

// 支付方式列表
const paymentMethods = [
  { label: '支付宝支付', value: 'alipay' },
  { label: '微信支付', value: 'wxpay' },
  { label: 'QQ钱包支付', value: 'qqpay' }
]

// 选中的支付方式
const selectedMethod = ref('')

// 商品信息（示例）
const product = reactive({
  name: '测试商品',
  price: '1.00'
})

// 创建支付订单
const createPayment = async () => {
  try {
    // 生成订单号
    const outTradeNo = 'ORDER' + Date.now()
    
    // 构建支付参数
    const payParams = {
      type: selectedMethod.value,
      out_trade_no: outTradeNo,
      name: product.name,
      money: product.price,
      notify_url: 'https://your-domain.com/epay/notify',  // 异步通知地址
      return_url: 'https://your-domain.com/epay/return',  // 同步跳转地址
    }

    // 调用后端创建支付订单接口
    const response = await axios.post('/epay/create', payParams)
    
    if (response.data.code === 1) {
      // 成功创建订单，获取支付URL
      const payUrl = response.data.data.payurl
      // 跳转到支付页面
      window.location.href = payUrl
    } else {
      alert('创建支付订单失败：' + response.data.msg)
    }
  } catch (error) {
    console.error('支付请求失败:', error)
    alert('支付请求失败，请稍后重试')
  }
}
</script>

<style scoped>
.payment-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
}

.product-info {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.payment-methods {
  margin-bottom: 20px;
}

.method-list {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.method-list label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.pay-button {
  width: 100%;
  padding: 12px;
  background-color: #409EFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.pay-button:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.pay-button:hover:not(:disabled) {
  background-color: #66b1ff;
}
</style> 