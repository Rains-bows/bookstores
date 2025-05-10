<template>
  <view class="container">
    <view class="about-content">
      <image src="/static/images/logo.png" mode="aspectFit" class="logo"/>
      <view class="app-name">情趣商城</view>
      <view class="version">版本号：1.0.0</view>
      
      <view class="info-list">
        <view class="info-item" @click="copyWechat">
          <text class="title">官方微信</text>
          <text class="value">qingqu666</text>
        </view>
        <view class="info-item">
          <text class="title">客服电话</text>
          <text class="value">400-888-8888</text>
        </view>
        <view class="info-item">
          <text class="title">商务合作</text>
          <text class="value">business@qingqu.com</text>
        </view>
      </view>
      
      <view class="copyright">
        Copyright © 2024 情趣商城 All Rights Reserved
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {}
  },
  methods: {
    copyWechat() {
      uni.setClipboardData({
        data: 'qingqu666',
        success: () => {
          uni.showToast({
            title: '微信号已复制',
            icon: 'success'
          })
        }
      })
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

.about-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .logo {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: 30rpx;
  }
  
  .app-name {
    font-size: 36rpx;
    color: #333;
    font-weight: bold;
    margin-bottom: 20rpx;
  }
  
  .version {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 60rpx;
  }
}

.info-list {
  width: 100%;
  background: #f8f8f8;
  border-radius: 12rpx;
  margin-bottom: 60rpx;
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
    
    .title {
      font-size: 28rpx;
      color: #333;
    }
    
    .value {
      font-size: 28rpx;
      color: #666;
    }
  }
}

.copyright {
  font-size: 24rpx;
  color: #999;
  text-align: center;
  position: fixed;
  bottom: 40rpx;
  left: 0;
  right: 0;
}
</style> 