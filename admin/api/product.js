import request from '@/utils/request'

// 获取分页商品列表
export function getProductsByPage(pageNum, pageSize) {
  return request({
    url: '/products/page',
    method: 'GET',
    data: {
      pageNum,
      pageSize
    }
  })
}

// 搜索商品
export function searchProducts(keyword, page, size) {
  return request({
    url: '/products/search',
    method: 'GET',
    data: {
      keyword,
      page,
      size
    }
  })
}

// 获取商品详情
export function getProductById(id) {
  return request({
    url: `/products/${id}`,
    method: 'GET'
  })
}

// 创建商品
export function createProduct(data) {
  return request({
    url: '/products',
    method: 'POST',
    data
  })
}

// 更新商品
export function updateProduct(data) {
  return request({
    url: `/products/${data.id}`,
    method: 'PUT',
    data
  })
}

// 删除商品
export function deleteProduct(id) {
  return request({
    url: `/products/${id}`,
    method: 'DELETE'
  })
} 