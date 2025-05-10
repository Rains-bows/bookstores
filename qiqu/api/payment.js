import { request } from '@/utils/request'

// 获取支付链接
export function getPayLink(params) {
  return request({
    url: '/epay/getPayLink',
    method: 'GET',
    params
  })
}

// 查询支付状态
export const queryPayStatus = (orderId) => {
  return request({
    url: '/epay/queryOrder',
    method: 'GET',
    params: {
      outTradeNo: orderId
    }
  })
}

// 查询商户信息
export const queryMerchantInfo = () => {
  return request({
    url: '/epay/merchant/info',
    method: 'GET'
  })
}

// 批量查询订单
export const queryOrders = (limit = 20) => {
  return request({
    url: '/epay/orders',
    method: 'GET',
    params: { limit }
  })
}

// 申请退款
export const refund = (orderId, money) => {
  return request({
    url: '/epay/refund',
    method: 'POST',
    data: {
      tradeNo: orderId,
      money
    }
  })
}

// 查询订单详情
export function queryOrder(outTradeNo) {
  return request({
    url: '/epay/queryOrder',
    method: 'GET',
    params: { 
      outTradeNo: parseInt(outTradeNo)  // 将字符串转换为整数
    }
  })
}

// 创建支付记录
export const createPayment = (data) => {
  return request({
    url: '/epay/create',
    method: 'POST',
    data
  })
}

// 支付通知
export const notifyPayment = (params) => {
  // 将参数转换为 URL 编码格式
  const formData = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) {  // 只添加非空值
      formData.append(key, value)
    }
  }
  
  return request({
    url: '/epay/notify',
    method: 'POST',
    data: formData.toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

// 支付同步通知
export const returnPayment = (params) => {
  // 只保留非空参数
  const queryParams = {}
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      queryParams[key] = value
    }
  }
  
  return request({
    url: '/epay/return',
    method: 'GET',
    params: queryParams
  })
}

// 创建支付订单
export const createPayOrder = (params) => {
  return request({
    url: '/epay/submitPay',
    method: 'POST',
    data: params,
    headers: {
      'Content-Type': 'application/json'
    }
  })
} 