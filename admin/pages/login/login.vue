<template>
  <view class="login-container">
    <view class="login-box">
      <view class="title">{{ showSecondAuth ? '二级验证' : '管理员登录' }}</view>
      
      <!-- 第一阶段：账号密码登录 -->
      <view v-if="!showSecondAuth" class="input-group">
        <input 
          class="input-item" 
          type="text" 
          v-model="loginForm.username" 
          placeholder="请输入用户名"
        />
        <input 
          class="input-item" 
          type="password" 
          v-model="loginForm.password" 
          placeholder="请输入密码"
        />
        <button class="login-btn" @tap="handleFirstAuth">登录</button>
      </view>
      
      <!-- 第二阶段：二级密码验证 -->
      <view v-else class="input-group">
        <view class="auth-tip">请输入管理员/销售的二级密码进行验证</view>
        <input 
          class="input-item" 
          type="password" 
          v-model="secondPassword" 
          placeholder="请输入二级密码"
          @confirm="handleSecondAuth"
        />
        <button class="login-btn" @tap="handleSecondAuth">验证</button>
        <view class="back-btn" @tap="handleBack">返回重新登录</view>
      </view>
    </view>
  </view>
</template>

<script>
import { login } from '@/api/user.js'

export default {
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      secondPassword: '',
      showSecondAuth: false,
      // 静态二级密码，实际应该从后端获取或使用更安全的方式
      ADMIN_SECOND_PASSWORD: 'admin888',
	  EMPLOYEE_JUDGE_PASSWORD: 'xiaoshou888'
    }
  },
  methods: {
    async handleFirstAuth() {
      // 检查用户名和密码是否为空
      if (!this.loginForm.username || !this.loginForm.password) {
        uni.showToast({
          title: '请输入用户名和密码',
          icon: 'none'
        })
        return
      }

      // 检查用户名是否为 admin
      if (this.loginForm.username !== 'admin') {
        uni.showToast({
          title: '没有管理权限',
          icon: 'none'
        })
        return
      }
      
      try {
        const res = await login(this.loginForm)
        if (res.code === 1) {
          // 存储token和用户信息，但还不跳转
          uni.setStorageSync('token', res.data.token)
          uni.setStorageSync('userInfo', {
            userId: res.data.userId,
            username: res.data.username
          })
          
          // 显示二级密码输入
          this.showSecondAuth = true
        } else {
          uni.showToast({
            title: res.message || '登录失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('登录失败:', error)
        uni.showToast({
          title: '登录失败，请稍后重试',
          icon: 'none'
        })
      }
    },
    
    handleSecondAuth() {
      if (!this.secondPassword) {
        uni.showToast({
          title: '请输入二级密码',
          icon: 'none'
        })
        return
      }
      
      if (this.secondPassword === this.ADMIN_SECOND_PASSWORD) {
        // 二级密码验证成功，存储标记并跳转
        uni.setStorageSync('adminAuth', true)
        uni.showToast({
          title: '验证成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/index/index'
          })
        }, 1500)
      } else {
        uni.showToast({
          title: '二级密码错误',
          icon: 'none'
        })
      }
	  if (this.secondPassword === this.EMPLOYEE_JUDGE_PASSWORD) {
	    // 二级密码验证成功，存储标记并跳转
	    uni.setStorageSync('adminAuth', true)
	    uni.showToast({
	      title: '验证成功',
	      icon: 'success'
	    })
	    
	    setTimeout(() => {
	      uni.reLaunch({
	        url: '/pages/xiaoshou/xiaoshou'
	      })
	    }, 1500)
	  } else {
	    uni.showToast({
	      title: '二级密码错误',
	      icon: 'none'
	    })
	  }
    },
    
    handleBack() {
      this.showSecondAuth = false
      this.secondPassword = ''
      // 清除已存储的信息
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  
  .login-box {
    width: 80%;
    padding: 40rpx;
    background-color: #fff;
    border-radius: 20rpx;
    box-shadow: 0 0 20rpx rgba(0,0,0,0.1);
    
    .title {
      font-size: 40rpx;
      text-align: center;
      margin-bottom: 60rpx;
      color: #333;
    }
    
    .input-group {
      margin-bottom: 40rpx;
      
      .auth-tip {
        font-size: 28rpx;
        color: #666;
        text-align: center;
        margin-bottom: 30rpx;
      }
      
      .input-item {
        width: 100%;
        height: 90rpx;
        border: 1px solid #ddd;
        border-radius: 8rpx;
        margin-bottom: 20rpx;
        padding: 0 20rpx;
        box-sizing: border-box;
      }
    }
    
    .login-btn {
      width: 100%;
      height: 90rpx;
      background-color: #007AFF;
      color: #fff;
      border-radius: 8rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
    }
    
    .back-btn {
      text-align: center;
      font-size: 28rpx;
      color: #666;
      margin-top: 20rpx;
      text-decoration: underline;
    }
  }
}
</style>