const baseUrl = 'http://lapper.site/api'
// const baseUrl = 'http://localhost:8080/api'
// 不需要登录的白名单页面
const whiteList = [
  '/pages/login/login',
  '/pages/register/register',
  '/pages/reset-password/reset-password'
]

// 创建请求函数
export const request = (options) => {
  return new Promise((resolve, reject) => {
    try {
      // 处理请求配置
      const token = uni.getStorageSync('token')
      
      // 添加baseUrl
      options.url = baseUrl + options.url
      
      // 获取当前页面路径
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const currentPath = '/' + currentPage?.route
      
      // 判断当前页面是否在白名单中
      const isWhiteList = whiteList.includes(currentPath)
      
      // 非白名单页面且没有token时，抛出错误
      if (!isWhiteList && !token) {
        throw new Error('请先登录')
      }
      
      // 添加token
      if (token) {
        options.header = {
          ...options.header,
          'Authorization': token
        }
      }

      // GET请求或带params的请求特殊处理
      if (options.params) {
        const query = Object.keys(options.params)
          .filter(key => options.params[key] != null)
          .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(options.params[key])}`)
          .join('&')
        
        if (query) {
          options.url += (options.url.includes('?') ? '&' : '?') + query
        }
        
        // 删除params，避免重复添加
        delete options.params
      }
      
      console.log('Request:', {
        url: options.url,
        method: options.method,
        headers: options.header,
        data: options.data
      })

      // 发起请求
      uni.request({
        ...options,
        success: (response) => {
          // 处理响应
          if (response.data.code === 401) {
            // 清除登录状态
            uni.removeStorageSync('token')
            uni.removeStorageSync('userInfo')
            
            // 跳转到登录页
            setTimeout(() => {
              uni.redirectTo({
                url: '/pages/login/login'
              })
            }, 1500)
            
            reject(new Error('登录已过期,请重新登录'))
          } else {
            resolve(response.data)
          }
        },
        fail: (error) => {
          console.error('Request failed:', error)
          reject(error)
        }
      })
    } catch (error) {
      console.error('Request error:', error)
      reject(error)
    }
  })
} 