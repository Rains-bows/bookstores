import { request } from '@/utils/request'

// 获取搜索历史
export const getSearchHistory = () => {
  return request({
    url: '/search/history',
    method: 'GET'
  })
}

// 获取热门搜索
export const getHotSearch = () => {
  return request({
    url: '/search/hot',
    method: 'GET'
  })
}

// 搜索商品
export const searchProducts = (keyword, page = 1, size = 10) => {
  if (!keyword) {
    throw new Error('搜索关键词不能为空');
  }
  
  return request({
    url: '/products/search',
    method: 'GET',
    params: {
      keyword: keyword.trim(),
      page,
      size
    }
  })
}

// 清空搜索历史
export const clearSearchHistory = () => {
  return request({
    url: '/search/history/clear',
    method: 'POST'
  })
}

// 添加搜索历史
export const addSearchHistory = (keyword) => {
  return request({
    url: '/search/history/add',
    method: 'POST',
    data: { keyword }
  })
} 