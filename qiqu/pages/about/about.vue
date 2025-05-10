<template>
  <view class="container">
    <view class="logo">
      <image src="/static/images/heart.png" mode="aspectFit"/>
    </view>
    
    <view class="content">
      <view class="title">关于我们</view>
      <view class="text">
        这是一个示例商城应用，提供商品浏览、购物车、订单管理等功能。
      </view>
      
      <view class="version">
        <text>当前版本: v1.0.0</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.container {
  padding: 60rpx 30rpx;
}

.logo {
  text-align: center;
  margin-bottom: 60rpx;
  
  image {
    width: 200rpx;
    height: 200rpx;
  }
}

.content {
  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 30rpx;
  }
  
  .text {
    font-size: 28rpx;
    color: #666;
    line-height: 1.8;
    margin-bottom: 60rpx;
  }
  
  .version {
    text-align: center;
    font-size: 24rpx;
    color: #999;
  }
}
</style> 