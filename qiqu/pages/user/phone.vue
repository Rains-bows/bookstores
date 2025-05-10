<template>
  <view class="container">
    <view class="form">
      <!-- 手机号 -->
      <view class="form-item">
        <text class="label">手机号</text>
        <input 
          type="number" 
          v-model="form.phone"
          placeholder="请输入手机号"
          placeholder-class="placeholder"
          maxlength="11"
        />
      </view>
      
      <!-- 验证码 -->
      <view class="form-item">
        <text class="label">验证码</text>
        <view class="code-input">
          <input 
            type="number" 
            v-model="form.code"
            placeholder="请输入验证码"
            placeholder-class="placeholder"
            maxlength="6"
          />
          <text 
            class="send-btn" 
            :class="{ disabled: counting }"
            @click="sendCode"
          >
            {{ counting ? \`\${countdown}s后重发\` : '发送验证码' }}
          </text>
        </view>
      </view>
    </view>
    
    <view class="actions">
      <button class="submit-btn" @click="handleSubmit">确认绑定</button>
    </view>
  </view>
</template>

<script>
import { sendSmsCode, bindPhone } from '@/api/user'

export default {
  data() {
    return {
      form: {
        phone: '',
        code: ''
      },
      counting: false,
      countdown: 60
    }
  },
  
  methods: {
    // 表单验证
    validate() {
      if(!this.form.phone) {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        })
        return false
      }
      
      if(!/^1[3-9]\d{9}$/.test(this.form.phone)) {
        uni.showToast({
          title: '手机号格式不正确',
          icon: 'none'
        })
        return false
      }
      
      if(!this.form.code) {
        uni.showToast({
          title: '请输入验证码',
          icon: 'none'
        })
        return false
      }
      
      if(!/^\d{6}$/.test(this.form.code)) {
        uni.showToast({
          title: '验证码格式不正确',
          icon: 'none'
        })
        return false
      }
      
      return true
    },
    
    // 发送验证码
    async sendCode() {
      if(this.counting) return
      
      if(!this.form.phone) {
        return uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        })
      }
      
      if(!/^1[3-9]\d{9}$/.test(this.form.phone)) {
        return uni.showToast({
          title: '手机号格式不正确',
          icon: 'none'
        })
      }
      
      try {
        uni.showLoading({
          title: '发送中'
        })
        
        const res = await sendSmsCode({
          phone: this.form.phone,
          type: 'bind'
        })
        
        uni.hideLoading()
        
        if(res.code === 1) {
          uni.showToast({
            title: '发送成功',
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
        console.error('发送失败:', e)
        uni.showToast({
          title: e.message || '发送失败',
          icon: 'none'
        })
      }
    },
    
    // 表单提交
    async handleSubmit() {
      if(!this.validate()) return
      
      try {
        uni.showLoading({
          title: '提交中'
        })
        
        const res = await bindPhone({
          phone: this.form.phone,
          code: this.form.code
        })
        
        uni.hideLoading()
        
        if(res.code === 1) {
          uni.showToast({
            title: '绑定成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          throw new Error(res.message || '绑定失败')
        }
      } catch(e) {
        uni.hideLoading()
        console.error('绑定失败:', e)
        uni.showToast({
          title: e.message || '绑定失败',
          icon: 'none'
        })
      }
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
      
      .send-btn {
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
}
</style> 