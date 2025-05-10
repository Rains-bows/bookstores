import { request } from '@/utils/request'

// 更新订单状态
export function updateOrder(orderId, data) {
  return request({
    url: `/order/${orderId}`,
    method: 'PUT',
    data
  })
}

// 查询订单状态
export function queryOrder(orderId) {
  return request({
    url: `/epay/queryOrder`,
    method: 'GET',
    params: {
      outTradeNo: orderId
    }
  })
}

// 创建订单
export function createOrder(data) {
  return request({
    url: '/order/create',
    method: 'POST',
    data
  })
}

// 创建订单详情
export function createOrderDetail(data) {
  return request({
    url: '/orderDetails',
    method: 'POST',
    data
  })
}

// 获取订单列表
export function getOrderList() {
  return request({
    url: '/order/user/orders',
    method: 'GET'
  })
}

// 获取订单详情
export function getOrderById(id) {
  return request({
    url: `/order/${id}`,
    method: 'GET'
  })
}

// 根据状态获取订单
export function getOrdersByStatus(status) {
  return request({
    url: `/order/status/${status}`,
    method: 'GET'
  })
}

// 删除订单
export function deleteOrder(orderId) {
  return request({
    url: `/order/${orderId}`,
    method: 'DELETE'
  })
}