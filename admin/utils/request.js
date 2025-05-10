const baseURL = 'http://lapper.site/api'
// const baseURL='http://localhost:8080/api'
// 请求拦截器
const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    const adminAuth = uni.getStorageSync('adminAuth')
    const userInfo = uni.getStorageSync('userInfo')
    
    // 检查是否需要管理员权限的接口
    const adminApis = ['/products', '/categories', '/orderDetails']
    const isAdminApi = adminApis.some(api => options.url.includes(api))
    
    if (isAdminApi && (!adminAuth || !token || userInfo?.username !== 'admin')) {
      // 如果是管理接口但没有权限，清除所有认证信息并跳转到登录页
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
      uni.removeStorageSync('adminAuth')
      uni.showToast({
        title: '无权访问管理功能',
        icon: 'none'
      })
      uni.reLaunch({
        url: '/pages/login/login'
      })
      return reject(new Error('需要管理员权限'))
    }
    
    const defaultOptions = {
      url: baseURL + options.url,
      method: options.method || 'GET',
      header: {
        'Content-Type': 'application/json',
        // 如果有token，添加到请求头
        ...(token ? { 'Authorization':   token } : {}),
        // 添加额外的安全头
        ...(adminAuth ? { 'X-Admin-Auth': 'true' } : {}),
        ...options.header
      },
      data: options.data
    }

    uni.request({
      ...defaultOptions,
      success: (res) => {
        // 请求成功
        if (res.statusCode === 200) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          // token过期或无效
          uni.removeStorageSync('token')
          uni.removeStorageSync('userInfo')
          uni.removeStorageSync('adminAuth')
          uni.showToast({
            title: '请重新登录',
            icon: 'none'
          })
          // 跳转到登录页
          uni.reLaunch({
            url: '/pages/login/login'
          })
          reject(res)
        } else {
          reject(res)
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// 添加权限检查函数
export const checkAdminAuth = () => {
  const token = uni.getStorageSync('token')
  const adminAuth = uni.getStorageSync('adminAuth')
  const userInfo = uni.getStorageSync('userInfo')
  
  return token && adminAuth && userInfo?.username === 'admin'
}

export default request 