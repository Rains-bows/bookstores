<template>
  <view class="container">
    <view class="header">
      <view class="logo-wrapper">
        <!-- 原书城Logo保持路径不变 -->
        <image class="logo-image" src="/static/images/heart.png" mode="aspectFit" />
      </view>
      <text class="title">在线书城优选</text>
      <text class="version">v1.0.0</text>
    </view>
    
    <view class="content">
      <view class="section">
        <text class="section-title">关于我们</text>
        <text class="section-text">在线书城是专注正版图书的电商平台，汇集10万+出版书籍，为读者提供便捷购书、电子书试读、名家书单推荐等全方位阅读服务。</text>
      </view>
      
      <view class="section">
        <text class="section-title">核心优势</text>
        <view class="advantages">
          <view class="advantage-item">
            <text class="iconfont icon-shield"></text>
            <text class="name">出版社直供</text>
            <text class="desc">与百家出版社战略合作，保证正版</text>
          </view>
          <view class="advantage-item">
            <text class="iconfont icon-privacy"></text>
            <text class="name">智能推荐</text>
            <text class="desc">基于阅读偏好推送个性化书单</text>
          </view>
          <view class="advantage-item">
            <text class="iconfont icon-service"></text>
            <text class="name">阅读社区</text>
            <text class="desc">百万书友交流读书心得</text>
          </view>
          <view class="advantage-item">
            <text class="iconfont icon-price"></text>
            <text class="name">会员特权</text>
            <text class="desc">专享9折购书+电子书免费读</text>
          </view>
        </view>
      </view>
      
      <view class="section">
        <text class="section-title">联系我们</text>
        <view class="contact-list">
          <view class="contact-item">
            <text class="label">客服热线：</text>
            <text class="value">400-800-1234</text>
          </view>
          <view class="contact-item">
            <text class="label">合作邮箱：</text>
            <text class="value">publishing@bookcity.com</text>
          </view>
          <view class="contact-item">
            <text class="label">总部地址：</text>
            <text class="value">北京市朝阳区图书大厦A座18层</text>
          </view>
        </view>
        
        <view class="wx-qrcode">
          <text class="qrcode-title">扫码关注读者俱乐部</text>
          <!-- 原二维码图片路径未变更 -->
          <image 
            src="/static/images/mywx.jpg" 
            mode="aspectFit" 
            class="qrcode-image"
            @click="previewImage"
          />
          <text class="qrcode-tip">(长按识别关注领新人礼包)</text>
        </view>
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
    previewImage() {
      uni.previewImage({
        urls: ['/static/images/mywx.jpg'],
        current: 0
      })
    }
  }
}
</script>

<style scoped lang="scss">
.container {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: env(safe-area-inset-bottom);
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  background: linear-gradient(135deg, #FE8C00, #FF4444);
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -40rpx;
    height: 80rpx;
    background: #f8f8f8;
    border-radius: 50% 50% 0 0;
  }
  
  .logo-wrapper {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: 20rpx;
    border-radius: 30rpx;
    box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.15);
    background: #fff;
    padding: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .logo-image {
      width: 120rpx;
      height: 120rpx;
      display: block;
    }
  }
  
  .title {
    font-size: 40rpx;
    color: #fff;
    font-weight: bold;
    margin-bottom: 10rpx;
    text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.2);
  }
  
  .version {
    font-size: 24rpx;
    color: rgba(255,255,255,0.9);
    background: rgba(0,0,0,0.1);
    padding: 4rpx 20rpx;
    border-radius: 20rpx;
  }
}

.content {
  margin-top: -40rpx;
  padding: 40rpx;
  position: relative;
  z-index: 1;
  
  .section {
    background: #fff;
    border-radius: 24rpx;
    padding: 40rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .section-title {
      font-size: 32rpx;
      color: #333;
      font-weight: bold;
      margin-bottom: 30rpx;
      display: flex;
      align-items: center;
      
      &::before {
        content: '';
        width: 6rpx;
        height: 32rpx;
        background: linear-gradient(to bottom, #FE8C00, #FF4444);
        margin-right: 16rpx;
        border-radius: 3rpx;
      }
    }
    
    .section-text {
      font-size: 28rpx;
      color: #666;
      line-height: 1.8;
    }
  }
}

.advantages {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  
  .advantage-item {
    background: linear-gradient(135deg, rgba(254,140,0,0.05), rgba(255,68,68,0.05));
    border-radius: 20rpx;
    padding: 30rpx;
    text-align: center;
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.98);
    }
    
    .iconfont {
      font-size: 80rpx;
      background: linear-gradient(135deg, #FE8C00, #FF4444);
      -webkit-background-clip: text;
      color: transparent;
      margin-bottom: 20rpx;
      display: block;
    }
    
    .name {
      font-size: 28rpx;
      color: #333;
      font-weight: bold;
      margin-bottom: 10rpx;
      display: block;
    }
    
    .desc {
      font-size: 24rpx;
      color: #666;
      line-height: 1.4;
    }
  }
}

.contact-list {
  margin-bottom: 40rpx;
  
  .contact-item {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    padding: 20rpx;
    background: rgba(254,140,0,0.05);
    border-radius: 16rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      font-size: 28rpx;
      color: #333;
      width: 160rpx;
      font-weight: 500;
    }
    
    .value {
      flex: 1;
      font-size: 28rpx;
      color: #666;
    }
  }
}

.wx-qrcode {
  text-align: center;
  background: linear-gradient(135deg, rgba(254,140,0,0.05), rgba(255,68,68,0.05));
  border-radius: 24rpx;
  padding: 40rpx;
  
  .qrcode-title {
    font-size: 30rpx;
    color: #333;
    margin-bottom: 30rpx;
    display: block;
    font-weight: bold;
  }
  
  .qrcode-image {
    width: 360rpx;
    height: 360rpx;
    margin: 0 auto;
    border-radius: 20rpx;
    box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.1);
    border: 8rpx solid #fff;
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.98);
    }
  }
  
  .qrcode-tip {
    font-size: 24rpx;
    color: #999;
    margin-top: 20rpx;
    display: block;
    background: rgba(0,0,0,0.05);
    padding: 8rpx 30rpx;
    border-radius: 24rpx;
    display: inline-block;
  }
}
</style> 