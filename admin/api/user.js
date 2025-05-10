import request from '@/utils/request'

// 用户登录
export function login(data) {
  return request({
    url: '/user/login',
    method: 'POST',
    data
  })
}

// 获取当前用户信息
export function getCurrentUser() {
  return request({
    url: '/user/current',
    method: 'GET'
  })
} 