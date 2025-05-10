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
        <text class="label">邮箱</text>
        <input 
          type="text" 
          v-model="form.email"
          placeholder="请输入邮箱"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-item">
        <text class="label">验证码</text>
        <view class="code-input">
          <input 
            type="text" 
            v-model="form.emailCode"
            placeholder="请输入验证码"
            placeholder-class="placeholder"
          />
          <text 
            class="code-btn" 
            :class="{ disabled: counting }"
            @click="sendCode"
          >
            {{ counting ? `${countdown}s后重发` : '获取验证码' }}
          </text>
        </view>
      </view>
      
      <view class="form-item">
        <text class="label">新密码</text>
        <input 
          type="password" 
          v-model="form.newPassword"
          placeholder="请输入新密码"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-item">
        <text class="label">确认密码</text>
        <input 
          type="password" 
          v-model="form.confirmPassword"
          placeholder="请再次输入新密码"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="tips">
        <text class="tip-item">密码长度为6-20位</text>
        <text class="tip-item">必须包含字母和数字</text>
      </view>
    </view>
    
    <view class="actions">
      <button class="submit-btn" @click="handleSubmit">重置密码</button>
      <view class="back-btn" @click="goBack">返回登录</view>
    </view>
  </view>
</template>

<script>
import { sendEmailCode, resetPassword } from '@/api/user'

export default {
  data() {
    return {
      form: {
        username: '',
        email: '',
        emailCode: '',
        newPassword: '',
        confirmPassword: ''
      },
      counting: false,
      countdown: 60
    }
  },
  
  methods: {
    // 发送验证码
    async sendCode() {
      if(this.counting) return
      
      if(!this.form.username) {
        return uni.showToast({
          title: '请输入用户名',
          icon: 'none'
        })
      }
      
      if(!this.form.email) {
        return uni.showToast({
          title: '请输入邮箱',
          icon: 'none'
        })
      }
      
      try {
        uni.showLoading({
          title: '发送中'
        })
        
        const res = await sendEmailCode({
          username: this.form.username,
          email: this.form.email
        })
        
        uni.hideLoading()
        
        if(res.code === 1) {
          uni.showToast({
            title: '验证码已发送',
            icon: 'success'
          })
          
          // 开始倒计时
          this.counting = true
          this.countdown = 60
          
          const timer = setInterval(() => {
            if(this.countdown > 0) {
              this.countdown--
            } else {
              this.counting = false
              clearInterval(timer)
            }
          }, 1000)
        } else {
          throw new Error(res.message || '发送失败')
        }
      } catch(e) {
        uni.hideLoading()
        console.error('发送验证码失败:', e)
        uni.showToast({
          title: e.message || '发送失败',
          icon: 'none'
        })
      }
    },
    
    // 表单提交
    async handleSubmit() {
      if(!this.form.username) {
        return uni.showToast({
          title: '请输入用户名',
          icon: 'none'
        })
      }
      
      if(!this.form.emailCode) {
        return uni.showToast({
          title: '请输入验证码',
          icon: 'none'
        })
      }
      
      if(!this.form.newPassword) {
        return uni.showToast({
          title: '请输入新密码',
          icon: 'none'
        })
      }
      
      if(!this.form.confirmPassword) {
        return uni.showToast({
          title: '请确认新密码',
          icon: 'none'
        })
      }
      
      if(this.form.newPassword !== this.form.confirmPassword) {
        return uni.showToast({
          title: '两次输入的密码不一致',
          icon: 'none'
        })
      }
      
      try {
        uni.showLoading({
          title: '提交中'
        })
        
        const res = await resetPassword({
          username: this.form.username,
          newPassword: this.form.newPassword,
          emailCode: this.form.emailCode
        })
        
        uni.hideLoading()
        
        if(res.code === 1) {
          uni.showToast({
            title: '重置成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          throw new Error(res.message || '重置失败')
        }
      } catch(e) {
        uni.hideLoading()
        console.error('重置密码失败:', e)
        uni.showToast({
          title: e.message || '重置失败',
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
    
    .code-input {
      display: flex;
      align-items: center;
      
      input {
        flex: 1;
      }
      
      .code-btn {
        width: 200rpx;
        height: 88rpx;
        line-height: 88rpx;
        background: #FE8C00;
        border-radius: 44rpx;
        color: #fff;
        font-size: 28rpx;
        text-align: center;
        margin-left: 20rpx;
        
        &.disabled {
          background: #ccc;
        }
      }
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