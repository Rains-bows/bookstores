import request from '@/utils/request'

// 获取所有非待付款订单详情
export function getAllOrderDetails() {
  return request({
    url: '/orderDetails/list',
    method: 'GET'
  })
}

// 获取指定订单的详情
export function getOrderDetailInfo(orderId) {
  return request({
    url: `/orderDetails/order/${orderId}`,
    method: 'GET'
  })
}

// 更新订单状态
export function updateOrderStatus(orderId, status) {
  return request({
    url: `/order/${orderId}`,
    method: 'PUT',
    data: { 
      id: orderId,
      status: status 
    }
  })
}

// 获取所有订单
export function getAllOrders() {
  return request({
    url: '/order/list',
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

// 获取订单详情
export function getOrderById(id) {
  return request({
    url: `/order/${id}`,
    method: 'GET'
  })
}

// 更新订单
export function updateOrder(data) {
  return request({
    url: `/order/${data.id}`,
    method: 'PUT',
    data
  })
} 