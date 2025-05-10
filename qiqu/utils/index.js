// 不需要登录的白名单页面
const whiteList = [
  '/pages/mall/mall',  // 商城首页
  '/pages/category/category',  // 分类页
  '/pages/login/login',  // 登录页
  '/pages/register/register',  // 注册页
  '/pages/reset-password/reset-password',  // 重置密码页
  '/pages/product/detail',  // 商品详情页
  '/pages/search/index',  // 搜索页
  '/pages/search/search',  // 搜索结果页
  '/pages/about/index',  // 关于我们
]

// 初始化白名单
export const initWhiteList = () => {
  uni.setStorageSync('whiteList', whiteList)
}

// 检查页面是否在白名单中
export const checkWhiteList = (path) => {
  const list = uni.getStorageSync('whiteList') || []
  return list.includes(path)
} 