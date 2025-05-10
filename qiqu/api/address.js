import { request } from '@/utils/request'

// 获取用户地址列表
export const getAddressList = async (userId) => {
  try {
    const res = await request({
      url: `/userAddress/findByUserId/${userId}`,
      method: 'GET'
    })
    return {
      code: res.code || 1,
      message: res.message || 'success',
      data: res.data || []
    }
  } catch (error) {
    return {
      code: 0,
      message: error.message || '获取地址列表失败',
      data: null
    }
  }
}

// 获取地址详情
export const getAddressDetail = async (id) => {
  try {
    const res = await request({
      url: `/userAddress/findById/${id}`,
      method: 'GET'
    })
    return {
      code: res.code || 1,
      message: res.message || 'success',
      data: res.data || null
    }
  } catch (error) {
    return {
      code: 0,
      message: error.message || '获取地址详情失败',
      data: null
    }
  }
}

// 新增地址
export const addAddress = async (data) => {
  try {
    const res = await request({
      url: '/userAddress/insert',
      method: 'POST',
      data
    })
    return {
      code: res.code || 1,
      message: res.message || 'success',
      data: res.data || null
    }
  } catch (error) {
    return {
      code: 0,
      message: error.message || '新增地址失败',
      data: null
    }
  }
}

// 更新地址
export const updateAddress = async (data) => {
  try {
    const res = await request({
      url: '/userAddress/update',
      method: 'PUT',
      data
    })
    return {
      code: res.code || 1,
      message: res.message || 'success',
      data: res.data || null
    }
  } catch (error) {
    return {
      code: 0,
      message: error.message || '更新地址失败',
      data: null
    }
  }
}

// 删除地址
export const deleteAddress = async (id) => {
  try {
    const res = await request({
      url: `/userAddress/delete/${id}`,
      method: 'DELETE'
    })
    return {
      code: res.code || 1,
      message: res.message || 'success',
      data: null
    }
  } catch (error) {
    return {
      code: 0,
      message: error.message || '删除地址失败',
      data: null
    }
  }
}