// 环境配置
const env = process.env.NODE_ENV || 'development'

// 基础配置
const baseConfig = {
  // 开发环境配置
  development: {
    baseUrl: 'http://localhost:8080/',
    uploadUrl: 'http://localhost:8080/api/upload'
  },
  // 生产环境配置
  production: {
 baseUrl: 'https://zaihui.xyz:8080/api', // 修改为域名
    uploadUrl: 'https://zaihui.xyz:8080/api/upload' // 修改为域名
  }
}

// 当前环境配置
const currentConfig = baseConfig[env]

// 白名单页面
export const whiteList = [
  '/pages/login/login',
  '/pages/register/register',
  '/pages/reset-password/reset-password',
  '/pages/yindao/yindao'
]

// 默认导出配置
export default {
  env,
  whiteList,
  // 接口请求地址
  baseUrl: currentConfig.baseUrl,
  // 文件上传地址
  uploadUrl: currentConfig.uploadUrl,
  // 请求超时时间
  timeout: 10000,
  // 请求头
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
} 