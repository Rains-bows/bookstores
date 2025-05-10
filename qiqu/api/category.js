import { request } from '@/utils/request'

// 获取分类列表
export const getCategoryList = () => {
  return request({
    url: '/categories',
    method: 'GET'
  })
}

// 获取分类详情
export const getCategoryById = (id) => {
  return request({
    url: `/categories/${id}`,
    method: 'GET'
  })
}

// 获取分类及其商品
export const getCategoryWithProducts = (id) => {
  return request({
    url: `/categories/${id}/products`,
    method: 'GET'
  })
} 