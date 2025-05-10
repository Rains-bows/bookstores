// 登录方法
async handleLogin() {
  try {
    const res = await login({
      username: this.username,
      password: this.password
    })
    
    if (res.code === 200) {
      // 保存token和用户信息
      uni.setStorageSync('token', res.data.token)
      uni.setStorageSync('userInfo', {
        id: res.data.userId,
        username: res.data.username
      })
      
      // 显示登录成功提示
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
      // 延迟跳转到首页
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/mall/mall'
        })
      }, 1500)
    } else {
      uni.showToast({
        title: res.msg,
        icon: 'none'
      })
    }
  } catch (e) {
    uni.showToast({
      title: '登录失败',
      icon: 'none'
    })
  }
} 