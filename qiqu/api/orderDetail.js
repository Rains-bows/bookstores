import { request } from '@/utils/request'

// 创建订单详情
export const createOrderDetail = (orderDetail) => {
  return request({
    url: '/orderDetails',
    method: 'POST',
    data: orderDetail
  })
}

// 更新订单详情
export const updateOrderDetail = (id, orderDetail) => {
  return request({
    url: `/orderDetails/${id}`,
    method: 'PUT',
    data: orderDetail
  })
}

// 获取订单详情
export const getOrderDetailById = (id) => {
  return request({
    url: `/orderDetails/${id}`,
    method: 'GET'
  })
}

// 删除订单详情
export const deleteOrderDetail = (id) => {
  return request({
    url: `/orderDetails/${id}`,
    method: 'DELETE'
  })
}