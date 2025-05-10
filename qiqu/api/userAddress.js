import { request } from '@/utils/request'

// 获取地址列表
export const getAddressList = (userId) => {
  if (!userId) {
    throw new Error('用户ID不能为空')
  }
  return request({
    url: '/userAddress/list',
    method: 'GET',
    params: { userId }
  })
}

// 添加地址
export const addAddress = (data) => {
  return request({
    url: '/address/add',
    method: 'POST',
    data
  })
}

// 更新地址
export const updateAddress = (data) => {
  return request({
    url: '/address/update',
    method: 'PUT',
    data
  })
}

// 删除地址
export const deleteAddress = (id) => {
  return request({
    url: `/address/delete/${id}`,
    method: 'DELETE'
  })
}

// 设置默认地址
export const setDefaultAddress = (id) => {
  return request({
    url: `/address/setDefault/${id}`,
    method: 'PUT'
  })
}

// 获取地址详情
export const getAddressDetail = (id) => {
  return request({
    url: `/address/detail/${id}`,
    method: 'GET'
  })
} 