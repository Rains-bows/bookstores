<template>
  <view class="container">
    <view class="security-list">
      <view class="security-item" @click="changePassword">
        <text class="title">修改密码</text>
        <text class="iconfont icon-right"></text>
      </view>
      <view class="security-item" @click="bindPhone">
        <text class="title">手机绑定</text>
        <text class="value">{{ userInfo.phone || '未绑定' }}</text>
        <text class="iconfont icon-right"></text>
      </view>
    </view>
  </view>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {}
  },
  computed: {
    ...mapState(['userInfo'])
  },
  methods: {
    changePassword() {
      uni.showToast({
        title: '暂未开放',
        icon: 'none'
      })
    },
    bindPhone() {
      uni.showToast({
        title: '暂未开放',
        icon: 'none'
      })
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

.security-list {
  background: #fff;
  border-radius: 12rpx;
  
  .security-item {
    display: flex;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .title {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }
    
    .value {
      font-size: 28rpx;
      color: #999;
      margin-right: 20rpx;
    }
    
    .icon-right {
      font-size: 24rpx;
      color: #999;
    }
  }
}
</style> 