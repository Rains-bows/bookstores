import { request } from '@/utils/request'

// 用户登录
export const login = (data) => {
  return request({
    url: '/user/login',
    method: 'POST',
    data
  })
}

// 用户注册
export const register = (data) => {
  return request({
    url: '/user/register',
    method: 'POST',
    data
  })
}

// 更新用户信息
export const updateUser = (data) => {
  return request({
    url: '/user/update',
    method: 'PUT',
    data
  })
}

// 发送邮箱验证码
export const sendEmailCode = (data) => {
  return request({
    url: '/user/send-email-code',
    method: 'POST',
    params: {
      username: data.username,
      email: data.email
    }
  })
}

// 重置密码
export const resetPassword = (data) => {
  const formData = new URLSearchParams()
  formData.append('username', data.username)
  formData.append('newPassword', data.newPassword)
  formData.append('emailCode', data.emailCode)
  
  return request({
    url: '/user/reset-password',
    method: 'POST',
    data: formData.toString(),
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

// 验证邮箱验证码
export const verifyEmailCode = (data) => {
  return request({
    url: '/user/test-email-code',
    method: 'POST',
    params: {
      code: data.code,
      userName: data.username
    }
  })
}

// 获取用户信息
export const getUserInfo = (username) => {
  return request({
    url: '/user/info',
    method: 'GET',
    params: { username }
  })
}

// 获取当前用户信息
export const getCurrentUser = () => {
  return request({
    url: '/user/current',
    method: 'GET'
  })
}