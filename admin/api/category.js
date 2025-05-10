import request from '@/utils/request'

// 获取所有分类
export function getAllCategories() {
  return request({
    url: '/categories',
    method: 'GET'
  })
}

// 创建分类
export function createCategory(data) {
  return request({
    url: '/categories',
    method: 'POST',
    data
  })
}

// 更新分类
export function updateCategory(id, data) {
  return request({
    url: `/categories/${id}`,
    method: 'PUT',
    data
  })
}

// 删除分类
export function deleteCategory(id) {
  return request({
    url: `/categories/${id}`,
    method: 'DELETE'
  })
} 