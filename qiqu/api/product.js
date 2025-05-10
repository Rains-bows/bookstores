import { request } from '@/utils/request'

// 获取商品列表
export const getProductList = (pageNum = 1, pageSize = 10) => {
  return request({
    url: '/products/page',
    method: 'GET',
    params: {
      pageNum,
      pageSize
    }
  })
}

// 获取推荐商品
export const getRecommendProducts = () => {
  return request({
    url: '/products',
    method: 'GET'
  })
}

// 获取商品详情
export const getProductDetail = (id) => {
  return request({
    url: `/products/${id}`,
    method: 'GET'
  })
}

// 获取分类列表
export const getCategoryList = () => {
  return request({
    url: '/categories',
    method: 'GET'
  })
}

// 搜索商品
export const searchProducts = (keyword, page = 1, size = 10) => {
  return request({
    url: '/products/search',
    method: 'GET',
    params: {
      keyword: keyword.trim(),
      pageNum: page,
      pageSize: size
    }
  })
}