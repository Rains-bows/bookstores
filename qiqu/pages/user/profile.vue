<template>
  <view class="profile-container">
    <!-- 用户信息 -->
    <view class="user-info">
      <image class="avatar" :src="userInfo.avatar || '/static/images/default-avatar.png'" mode="aspectFill"/>
      <text class="nickname">{{ userInfo.nickname || '未登录' }}</text>
    </view>
    
    <!-- 功能列表 -->
    <view class="menu-list">
      <view class="menu-group">
        <view class="menu-item" @tap="goToOrders">
          <text class="iconfont icon-order"></text>
          <text class="label">我的订单</text>
          <text class="iconfont icon-right"></text>
        </view>
        
        <view class="menu-item" @tap="goToAddress">
          <text class="iconfont icon-address"></text>
          <text class="label">收货地址</text>
          <text class="iconfont icon-right"></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {}
    }
  },
  
  onShow() {
    // 获取用户信息
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo) {
      this.userInfo = userInfo
    }
  },
  
  methods: {
    goToOrders() {
      uni.navigateTo({
        url: '/pages/order/list'
      })
    },
    
    goToAddress() {
      uni.navigateTo({
        url: '/pages/address/list'
      })
    }
  }
}
</script>

<style lang="scss">
.profile-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: env(safe-area-inset-bottom);
}

.user-info {
  height: 300rpx;
  background: linear-gradient(135deg, #1890ff, #1890ff99);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 40rpx;
  
  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 60rpx;
    border: 4rpx solid rgba(255,255,255,0.3);
    margin-bottom: 20rpx;
  }
  
  .nickname {
    font-size: 32rpx;
    color: #fff;
    font-weight: 500;
  }
}

.menu-list {
  padding: 20rpx;
  
  .menu-group {
    background: #fff;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
    
    .menu-item {
      height: 100rpx;
      display: flex;
      align-items: center;
      padding: 0 30rpx;
      
      &:not(:last-child) {
        border-bottom: 2rpx solid #f5f5f5;
      }
      
      .iconfont {
        font-size: 40rpx;
        color: #666;
        
        &.icon-right {
          font-size: 32rpx;
          color: #999;
          margin-left: auto;
        }
      }
      
      .label {
        font-size: 28rpx;
        color: #333;
        margin-left: 20rpx;
      }
      
      &:active {
        background: #f5f7fa;
      }
    }
  }
}
</style> 