import { request } from '@/utils/request'

// 添加商品到购物车
export const addToCart = (data) => {
  return request({
    url: '/cart',
    method: 'POST',
    data
  })
}

// 获取用户购物车列表
export const getCartByUserId = (userId) => {
  return request({
    url: `/cart/user/${userId}`,
    method: 'GET'
  })
}

// 根据ID获取购物车项
export const getCartById = (id) => {
  return request({
    url: `/cart/${id}`,
    method: 'GET'
  })
}

// 更新购物车项
export const updateCart = (id, data) => {
  return request({
    url: `/cart/${id}`,
    method: 'PUT',
    data
  })
}

// 删除购物车项
export const deleteCart = (id) => {
  return request({
    url: `/cart/${id}`,
    method: 'DELETE'
  })
}