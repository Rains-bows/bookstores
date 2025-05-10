<template>
  <view class="container">
    <view class="form">
      <view class="form-item">
        <text class="label">原密码</text>
        <input 
          type="password" 
          v-model="form.oldPassword"
          placeholder="请输入原密码"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-item">
        <text class="label">新密码</text>
        <input 
          type="password" 
          v-model="form.newPassword"
          placeholder="请输入新密码"
          placeholder-class="placeholder"
        />
        <text class="tip">密码长度为6-20位，必须包含字母和数字</text>
      </view>
      
      <view class="form-item">
        <text class="label">确认新密码</text>
        <input 
          type="password" 
          v-model="form.confirmPassword"
          placeholder="请再次输入新密码"
          placeholder-class="placeholder"
        />
      </view>
    </view>
    
    <view class="actions">
      <button class="submit-btn" @click="handleSubmit">确认修改</button>
      <text class="forget-link" @click="navigateTo('/pages/user/reset-password')">忘记原密码？</text>
    </view>
  </view>
</template>

<script>
import { changePassword } from '@/api/user'

export default {
  data() {
    return {
      form: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  },
  
  methods: {
    // 表单验证
    validate() {
      if(!this.form.oldPassword) {
        uni.showToast({
          title: '请输入原密码',
          icon: 'none'
        })
        return false
      }
      
      if(!this.form.newPassword) {
        uni.showToast({
          title: '请输入新密码',
          icon: 'none'
        })
        return false
      }
      
      if(!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/.test(this.form.newPassword)) {
        uni.showToast({
          title: '新密码格式不正确',
          icon: 'none'
        })
        return false
      }
      
      if(!this.form.confirmPassword) {
        uni.showToast({
          title: '请确认新密码',
          icon: 'none'
        })
        return false
      }
      
      if(this.form.newPassword !== this.form.confirmPassword) {
        uni.showToast({
          title: '两次输入的密码不一致',
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
          title: '提交中'
        })
        
        const res = await changePassword({
          oldPassword: this.form.oldPassword,
          newPassword: this.form.newPassword
        })
        
        uni.hideLoading()
        
        if(res.code === 1) {
          uni.showToast({
            title: '修改成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          throw new Error(res.message || '修改失败')
        }
      } catch(e) {
        uni.hideLoading()
        console.error('修改失败:', e)
        uni.showToast({
          title: e.message || '修改失败',
          icon: 'none'
        })
      }
    },
    
    // 页面跳转
    navigateTo(url) {
      uni.navigateTo({ url })
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
    
    .tip {
      font-size: 24rpx;
      color: #999;
      margin-top: 16rpx;
      padding-left: 40rpx;
      display: block;
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
    margin-bottom: 30rpx;
    
    &:active {
      opacity: 0.9;
    }
  }
  
  .forget-link {
    display: block;
    text-align: center;
    font-size: 28rpx;
    color: #999;
  }
}
</style> 