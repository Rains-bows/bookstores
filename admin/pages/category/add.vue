<template>
  <view class="container">
    <!-- 注意事项提示 -->
    <view class="tips-box">
      <view class="tips-title">注意事项：</view>
      <view class="tips-content">
        <text>1. 分类名称请勿包含色情、暴力等违规内容</text>
        <text>2. 建议使用"*"代替敏感词汇</text>
        <text>3. 描述内容应当简洁明了，易于理解</text>
      </view>
    </view>
    <view class="form">
      <view class="form-item">
        <text class="label">分类名称</text>
        <input 
          type="text"
          v-model="formData.name"
          placeholder="请输入分类名称"
          class="input"
        />
      </view>
      
      <view class="form-item">
        <text class="label">分类描述</text>
        <textarea
          v-model="formData.description"
          placeholder="请输入分类描述"
          class="textarea"
          maxlength="100"
        />
      </view>
      
      <button @tap="handleSubmit" class="submit-btn">添加</button>
    </view>
  </view>
</template>

<script>
import { createCategory } from '@/api/category.js'

export default {
  data() {
    return {
      formData: {
        name: '',
        description: '',
        isActive: 1
      }
    }
  },
  
  methods: {
    async handleSubmit() {
      if (!this.formData.name.trim()) {
        uni.showToast({
          title: '请输入分类名称',
          icon: 'none'
        })
        return
      }
      
      try {
        const res = await createCategory(this.formData)
        if (res.code === 1) {
          uni.showToast({
            title: '添加成功',
            icon: 'success'
          })
          // 立即获取上一页实例并调用刷新方法
          const pages = getCurrentPages()
          const prevPage = pages[pages.length - 2]
          if (prevPage) {
            // 确保上一页存在再调用刷新方法
            prevPage.$vm.loadCategories()
          }
          // 延迟返回，让用户看到成功提示
          setTimeout(() => {
            uni.navigateBack({
              success: () => {
                // 再次确保列表已刷新
                if (prevPage) {
                  prevPage.$vm.loadCategories()
                }
              }
            })
          }, 1500)
        }
      } catch (error) {
        uni.showToast({
          title: '添加失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
}

.form {
  background-color: #fff;
  padding: 20rpx;
  border-radius: 8rpx;
  
  .form-item {
    margin-bottom: 30rpx;
    
    .label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 10rpx;
    }
    
    .input {
      width: 100%;
      height: 80rpx;
      border: 1px solid #ddd;
      border-radius: 8rpx;
      padding: 0 20rpx;
      box-sizing: border-box;
    }
    
    .textarea {
      width: 100%;
      height: 200rpx;
      border: 1px solid #ddd;
      border-radius: 8rpx;
      padding: 20rpx;
      box-sizing: border-box;
    }
  }
  
  .submit-btn {
    width: 100%;
    height: 80rpx;
    line-height: 80rpx;
    background-color: #007AFF;
    color: #fff;
    border-radius: 8rpx;
    margin-top: 40rpx;
  }
}

.tips-box {
  background-color: #fff7e6;
  padding: 20rpx;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
  
  .tips-title {
    font-size: 28rpx;
    color: #f59a23;
    margin-bottom: 10rpx;
    font-weight: bold;
  }
  
  .tips-content {
    text {
      font-size: 24rpx;
      color: #666;
      display: block;
      line-height: 1.6;
    }
  }
}
</style> 