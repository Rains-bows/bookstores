<template>
  <view class="container">
    <view class="feedback-form">
      <view class="form-item">
        <textarea
          v-model="content"
          placeholder="请描述您遇到的问题或建议..."
          :maxlength="500"
          class="feedback-content"
        />
        <text class="word-count">{{ content.length }}/500</text>
      </view>
      
      <view class="form-item">
        <view class="contact-title">联系方式（选填）</view>
        <input
          v-model="contact"
          type="text"
          placeholder="请留下您的手机号或邮箱"
          class="contact-input"
        />
      </view>
      
      <view class="form-item">
        <view class="images-title">
          <text>上传图片（选填）</text>
          <text class="tip">{{ images.length }}/4</text>
        </view>
        <view class="images-list">
          <view 
            class="image-item" 
            v-for="(item, index) in images" 
            :key="index"
          >
            <image :src="item" mode="aspectFill"/>
            <text class="delete-btn" @click="deleteImage(index)">×</text>
          </view>
          <view 
            class="upload-btn" 
            v-if="images.length < 4"
            @click="chooseImage"
          >
            <text class="iconfont icon-add"></text>
          </view>
        </view>
      </view>
    </view>
    
    <button 
      class="submit-btn" 
      :disabled="!content"
      @click="submitFeedback"
    >
      提交反馈
    </button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      content: '',
      contact: '',
      images: []
    }
  },
  methods: {
    chooseImage() {
      uni.chooseImage({
        count: 4 - this.images.length,
        success: (res) => {
          this.images = [...this.images, ...res.tempFilePaths]
        }
      })
    },
    deleteImage(index) {
      this.images.splice(index, 1)
    },
    submitFeedback() {
      if(!this.content) {
        uni.showToast({
          title: '请输入反馈内容',
          icon: 'none'
        })
        return
      }
      
      uni.showToast({
        title: '反馈已提交',
        icon: 'success'
      })
      
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  }
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.feedback-form {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  
  .form-item {
    margin-bottom: 30rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .feedback-content {
    width: 100%;
    height: 300rpx;
    font-size: 28rpx;
    line-height: 1.5;
    padding: 20rpx;
    box-sizing: border-box;
    background: #f8f8f8;
    border-radius: 8rpx;
  }
  
  .word-count {
    font-size: 24rpx;
    color: #999;
    text-align: right;
    margin-top: 10rpx;
  }
  
  .contact-title {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .contact-input {
    width: 100%;
    height: 80rpx;
    font-size: 28rpx;
    padding: 0 20rpx;
    box-sizing: border-box;
    background: #f8f8f8;
    border-radius: 8rpx;
  }
  
  .images-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    text {
      font-size: 28rpx;
      color: #333;
    }
    
    .tip {
      color: #999;
    }
  }
  
  .images-list {
    display: flex;
    flex-wrap: wrap;
    
    .image-item {
      position: relative;
      width: 160rpx;
      height: 160rpx;
      margin-right: 20rpx;
      margin-bottom: 20rpx;
      
      image {
        width: 100%;
        height: 100%;
        border-radius: 8rpx;
      }
      
      .delete-btn {
        position: absolute;
        top: -20rpx;
        right: -20rpx;
        width: 40rpx;
        height: 40rpx;
        line-height: 40rpx;
        text-align: center;
        background: rgba(0,0,0,0.5);
        color: #fff;
        border-radius: 50%;
        font-size: 32rpx;
      }
    }
    
    .upload-btn {
      width: 160rpx;
      height: 160rpx;
      background: #f8f8f8;
      border-radius: 8rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .icon-add {
        font-size: 48rpx;
        color: #999;
      }
    }
  }
}

.submit-btn {
  margin-top: 40rpx;
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background: #FE8C00;
  color: #fff;
  font-size: 32rpx;
  border-radius: 40rpx;
  
  &[disabled] {
    background: #ccc;
  }
}
</style> 