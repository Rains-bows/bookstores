<template>
  <view class="container">
    <view class="form">
      <view class="input-group">
        <input 
          type="text"
          v-model="form.username"
          placeholder="请输入用户名"
        />
      </view>
      <view class="input-group">
        <input 
          type="password"
          v-model="form.password"
          placeholder="请输入密码"
        />
      </view>
      <button class="login-btn" @click="handleLogin">登录</button>
      <view class="actions">
        <text @click="goRegister">注册账号</text>
        <text @click="goResetPassword">忘记密码</text>
      </view>
    </view>
  </view>
</template>

<script>
import { login, getUserInfo } from '@/api/user'

export default {
  data() {
    return {
      form: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    async handleLogin() {
      if(!this.form.username || !this.form.password) {
        uni.showToast({
          title: '请输入用户名和密码',
          icon: 'none'
        })
        return
      }
      
      try {
        const res = await login(this.form)
        console.log('登录响应:', res)
        
        if(res.code === 1 && res.data) {
          const { token, userId, username } = res.data
          // 存储token
          uni.setStorageSync('token', token)
          // 存储用户信息
          uni.setStorageSync('userInfo', {
            id: userId,
            username: username
          })

          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/user/user'
            })
          }, 1500)
        } else {
          uni.showToast({
            title: res.message || '登录失败',
            icon: 'none'
          })
        }
      } catch(e) {
        console.error('登录失败:', e)
        uni.showToast({
          title: '登录失败',
          icon: 'none'
        })
      }
    },
    goRegister() {
      uni.navigateTo({
        url: '/pages/register/register'
      })
    },
    goResetPassword() {
      uni.navigateTo({
        url: '/pages/reset-password/reset-password'
      })
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/meituan.scss';

.container {
  padding: 40rpx;
}

.form {
  margin-top: 100rpx;
  
  .input-group {
    margin-bottom: 30rpx;
    
    input {
      width: 100%;
      height: 90rpx;
      background: #f5f5f5;
      border-radius: 45rpx;
      padding: 0 40rpx;
      font-size: 28rpx;
    }
  }
  
  .login-btn {
    width: 100%;
    height: 90rpx;
    line-height: 90rpx;
    @extend .mt-btn;
    color: #fff;
    border-radius: 45rpx;
    font-size: 32rpx;
    margin-top: 60rpx;
  }
  
  .actions {
    display: flex;
    justify-content: space-between;
    margin-top: 30rpx;
    
    text {
      font-size: 28rpx;
      color: $mt-orange;
    }
  }
}
</style>