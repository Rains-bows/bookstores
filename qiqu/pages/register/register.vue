<template>
  <view class="container">
    <view class="form">
      <view class="form-item">
        <text class="label">用户名</text>
        <input 
          type="text" 
          v-model="form.username"
          placeholder="请输入用户名"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-item">
        <text class="label">密码</text>
        <input 
          type="password" 
          v-model="form.password"
          placeholder="请输入密码"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-item">
        <text class="label">确认密码</text>
        <input 
          type="password" 
          v-model="form.confirmPassword"
          placeholder="请再次输入密码"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-item">
        <text class="label">邮箱</text>
        <input 
          type="text" 
          v-model="form.email"
          placeholder="请输入邮箱"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="tips">
        <text class="tip-item">用户名长度为4-20位</text>
        <text class="tip-item">密码长度为6-20位</text>
        <text class="tip-item">密码必须包含字母和数字</text>
      </view>
    </view>
    
    <view class="actions">
      <button class="submit-btn" @click="handleSubmit">注册</button>
      <view class="back-btn" @click="goBack">返回登录</view>
    </view>
  </view>
</template>

<script>
import { register } from '@/api/user'

export default {
  data() {
    return {
      form: {
        username: '',
        password: '',
        confirmPassword: '',
        email: ''
      }
    }
  },
  
  methods: {
    // 表单验证
    validate() {
      if(!this.form.username) {
        uni.showToast({
          title: '请输入用户名',
          icon: 'none'
        })
        return false
      }
      
      if(this.form.username.length < 4 || this.form.username.length > 20) {
        uni.showToast({
          title: '用户名长度为4-20位',
          icon: 'none'
        })
        return false
      }
      
      if(!this.form.password) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none'
        })
        return false
      }
      
      if(!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/.test(this.form.password)) {
        uni.showToast({
          title: '密码必须包含字母和数字，长度为6-20位',
          icon: 'none'
        })
        return false
      }
      
      if(!this.form.confirmPassword) {
        uni.showToast({
          title: '请确认密码',
          icon: 'none'
        })
        return false
      }
      
      if(this.form.password !== this.form.confirmPassword) {
        uni.showToast({
          title: '两次输入的密码不一致',
          icon: 'none'
        })
        return false
      }
      
      if(!this.form.email) {
        uni.showToast({
          title: '请输入邮箱',
          icon: 'none'
        })
        return false
      }
      
      if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.form.email)) {
        uni.showToast({
          title: '邮箱格式不正确',
          icon: 'none'
        })
        return false
      }
      
      return true
    },
    
    // 表单提交
    async handleSubmit() {
      if(!this.validate()) return
      
      try {
        uni.showLoading({
          title: '注册中'
        })
        
        const res = await register({
          username: this.form.username,
          password: this.form.password,
          email: this.form.email
        })
        
        uni.hideLoading()
        
        if(res.code === 1) {
          uni.showToast({
            title: '注册成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          throw new Error(res.message || '注册失败')
        }
      } catch(e) {
        uni.hideLoading()
        console.error('注册失败:', e)
        uni.showToast({
          title: e.message || '注册失败',
          icon: 'none'
        })
      }
    },
    
    // 返回登录页
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: #fff;
  padding: 40rpx;
}

.form {
  .form-item {
    margin-bottom: 40rpx;
    
    .label {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 20rpx;
      display: block;
    }
    
    input {
      height: 88rpx;
      background: #f8f8f8;
      border-radius: 44rpx;
      padding: 0 40rpx;
      font-size: 28rpx;
      color: #333;
    }
    
    .placeholder {
      color: #999;
    }
  }
}

.tips {
  margin-top: 30rpx;
  
  .tip-item {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 10rpx;
    display: block;
    
    &::before {
      content: '•';
      margin-right: 10rpx;
    }
  }
}

.actions {
  margin-top: 60rpx;
  
  .submit-btn {
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(to right, #FF6034, #FF4444);
    border-radius: 44rpx;
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    text-align: center;
    box-shadow: 0 4rpx 12rpx rgba(255,68,68,0.3);
    
    &:active {
      opacity: 0.9;
    }
  }
  
  .back-btn {
    margin-top: 30rpx;
    text-align: center;
    font-size: 28rpx;
    color: #FE8C00;
  }
}
</style>