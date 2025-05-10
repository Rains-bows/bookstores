<template>
  <view class="container">
    <view class="form">
      <view class="form-item">
        <text class="label">收货人</text>
        <input 
          type="text"
          v-model="form.recipientName"
          placeholder="请输入收货人姓名"
        />
      </view>
      
      <view class="form-item">
        <text class="label">手机号码</text>
        <input 
          type="number"
          v-model="form.phone"
          placeholder="请输入手机号码"
        />
      </view>
      
      <view class="form-item">
        <text class="label">详细地址</text>
        <textarea
          v-model="form.address"
          placeholder="请输入详细地址"
        />
      </view>
    </view>
    
    <button class="submit-btn" @click="handleSubmit">保存</button>
  </view>
</template>

<script>
import { addAddress, updateAddress, getAddressDetail } from '@/api/address'

export default {
  data() {
    return {
      form: {
        recipientName: '',
        phone: '',
        address: '',
        userId: ''
      },
      id: null // 编辑时的地址ID
    }
  },
  onLoad(options) {
    if(options.id) {
      this.id = options.id
      this.getDetail()
    }
    // 获取用户ID
    const userInfo = uni.getStorageSync('userInfo')
    if(userInfo) {
      this.form.userId = userInfo.id
    }
  },
  methods: {
    async getDetail() {
      try {
        const res = await getAddressDetail(this.id)
        if(res.code === 1) {
          this.form = res.data || {}
        } else {
          uni.showToast({
            title: res.message || '获取地址详情失败',
            icon: 'none'
          })
        }
      } catch(e) {
        console.error('获取地址详情失败:', e)
        uni.showToast({
          title: '获取地址详情失败',
          icon: 'none'
        })
      }
    },
    async handleSubmit() {
      // 表单验证
      if(!this.form.recipientName) {
        uni.showToast({
          title: '请输入收货人姓名',
          icon: 'none'
        })
        return
      }
      if(!this.form.phone) {
        uni.showToast({
          title: '请输入手机号码',
          icon: 'none'
        })
        return
      }
      if(!this.form.address) {
        uni.showToast({
          title: '请输入详细地址',
          icon: 'none'
        })
        return
      }
      
      try {
        const api = this.id ? updateAddress : addAddress
        const res = await api(this.form)
        if(res.code === 1) {
          uni.showToast({
            title: this.id ? '修改成功' : '添加成功',
            icon: 'success'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: res.message || (this.id ? '修改失败' : '添加失败'),
            icon: 'none'
          })
        }
      } catch(e) {
        console.error('保存地址失败:', e)
        uni.showToast({
          title: this.id ? '修改失败' : '添加失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss">
.container {
  padding: 30rpx;
}

.form {
  background: #fff;
  border-radius: 12rpx;
  padding: 0 30rpx;
  
  .form-item {
    padding: 30rpx 0;
    border-bottom: 1rpx solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .label {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 20rpx;
      display: block;
    }
    
    input, textarea {
      width: 100%;
      font-size: 28rpx;
      color: #333;
    }
    
    textarea {
      height: 160rpx;
      line-height: 1.5;
    }
  }
}

.submit-btn {
  margin-top: 60rpx;
  background: #FE8C00;
  color: #fff;
  border-radius: 45rpx;
  font-size: 32rpx;
}
</style> 