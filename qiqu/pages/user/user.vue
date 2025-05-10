<template>
  <view class="container">
    <!-- 用户信息区域 -->
    <view class="user-info">
      <image class="bg" src="/static/images/user-bg.jpg" mode="aspectFill" />
      <view class="content">
        <image 
          class="avatar" 
          :src="userInfo.avatar || '/static/images/default_male.jpeg'" 
          mode="aspectFill"
        />
        <view class="info">
          <text class="nickname">{{ userInfo.nickname || userInfo.username }}</text>
          <text class="id">ID: {{ userInfo.id }}</text>
        </view>
      </view>
    </view>
    
    <!-- 订单区域 -->
    <view class="order-card">
      <view class="header" @click="navigateTo('/pages/order/list?status=')">
        <text class="title">我的订单</text>
        <view class="more">
          <text>查看全部</text>
          <text class="iconfont icon-right"></text>
        </view>
      </view>
      
      <view class="order-types">
        <view 
          class="type-item" 
          v-for="(item, index) in orderTypes" 
          :key="index"
          @click="navigateTo(`/pages/order/list?status=${item.status}`)"
        >
          <view class="icon-wrap">
            <text class="iconfont" :class="item.icon"></text>
            <text class="badge" v-if="item.count > 0">{{ item.count }}</text>
          </view>
          <text class="name">{{ item.name }}</text>
        </view>
      </view>
    </view>
    
    <!-- 功能列表 -->
    <view class="menu-list">
      <view class="menu-group">
        <view class="menu-item" @click="navigateTo('/pages/address/list')">
          <text class="iconfont icon-location"></text>
          <text class="title">收货地址</text>
          <text class="iconfont icon-right"></text>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/about/index')">
          <text class="iconfont icon-info"></text>
          <text class="title">关于我们</text>
          <text class="iconfont icon-right"></text>
        </view>
        <view class="menu-item" @click="clearCache">
          <text class="iconfont icon-clear"></text>
          <text class="title">清理缓存</text>
          <text class="iconfont icon-right"></text>
        </view>
      </view>
    </view>
    
    <!-- 退出登录按钮 -->
    <view class="logout-btn" @click="handleLogout">退出登录</view>
  </view>
</template>

<script>
import { getCurrentUser } from '@/api/user'

export default {
  data() {
    return {
      userInfo: {
        id: '',
        username: '',
        nickname: '',
        avatar: ''
      },
      orderTypes: [
        {
          icon: '/images/home.png',
          name: '待付款',
          status: '待付款',
          count: 0
        },
        {
          icon: 'icon-box',
          name: '待发货',
          status: '待发货',
          count: 0
        },
        {
          icon: 'icon-truck',
          name: '已发货',
          status: '已发货',
          count: 0
        },
        {
          icon: 'icon-comment',
          name: '已完成',
          status: '已完成',
          count: 0
        }
      ]
    }
  },
  
  onShow() {
    this.loadUserInfo()
  },
  
  methods: {
    // 加载用户信息
    async loadUserInfo() {
      try {
        const res = await getCurrentUser()
        if(res.code === 1) {
          this.userInfo = {
            ...this.userInfo,
            ...res.data
          }
        } else {
          throw new Error(res.message || '获取用户信息失败')
        }
      } catch(e) {
        console.error('获取用户信息失败:', e)
        uni.showToast({
          title: e.message || '获取用户信息失败',
          icon: 'none'
        })
      }
    },
    
    // 页面跳转
    navigateTo(url) {
      uni.navigateTo({ url })
    },
    
    // 清理缓存
    clearCache() {
      uni.showModal({
        title: '提示',
        content: '确定要清理缓存吗？',
        success: (res) => {
          if(res.confirm) {
            uni.showLoading({
              title: '清理中'
            })
            
            // 清理缓存
            try {
              uni.clearStorageSync()
              setTimeout(() => {
                uni.hideLoading()
                uni.showToast({
                  title: '清理成功',
                  icon: 'success'
                })
              }, 1000)
            } catch(e) {
              uni.hideLoading()
              uni.showToast({
                title: '清理失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    
    // 退出登录
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if(res.confirm) {
            // 清除登录信息
            uni.removeStorageSync('token')
            uni.removeStorageSync('userInfo')
            
            // 跳转到登录页
            uni.reLaunch({
              url: '/pages/login/login'
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: env(safe-area-inset-bottom);
}

.user-info {
  height: 320rpx;
  position: relative;
  
  .bg {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
  }
  
  .content {
    position: relative;
    z-index: 1;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 40rpx;
    
    .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 60rpx;
      border: 4rpx solid #fff;
      box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
    }
    
    .info {
      flex: 1;
      margin-left: 30rpx;
      
      .nickname {
        font-size: 36rpx;
        color: #fff;
        font-weight: bold;
        margin-bottom: 10rpx;
        display: block;
      }
      
      .id {
        font-size: 24rpx;
        color: rgba(255,255,255,0.8);
      }
    }
  }
}

.order-card {
  margin: -40rpx 20rpx 0;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  position: relative;
  z-index: 1;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    .title {
      font-size: 32rpx;
      color: #333;
      font-weight: bold;
    }
    
    .more {
      display: flex;
      align-items: center;
      
      text {
        font-size: 24rpx;
        color: #999;
      }
      
      .icon-right {
        font-size: 24rpx;
        margin-left: 4rpx;
      }
    }
  }
  
  .order-types {
    display: flex;
    justify-content: space-between;
    
    .type-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .icon-wrap {
        position: relative;
        margin-bottom: 16rpx;
        
        .iconfont {
          font-size: 56rpx;
          background: linear-gradient(135deg, #FE8C00, #FF4444);
          -webkit-background-clip: text;
          color: transparent;
        }
        
        .badge {
          position: absolute;
          right: -16rpx;
          top: -16rpx;
          background: #FF4444;
          color: #fff;
          font-size: 20rpx;
          padding: 0 10rpx;
          height: 32rpx;
          line-height: 32rpx;
          border-radius: 16rpx;
          min-width: 32rpx;
          text-align: center;
        }
      }
      
      .name {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

.menu-list {
  margin: 20rpx;
  
  .menu-group {
    background: #fff;
    border-radius: 16rpx;
    padding: 0 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
    
    .menu-item {
      display: flex;
      align-items: center;
      padding: 30rpx 0;
      border-bottom: 1rpx solid #f5f5f5;
      
      &:last-child {
        border-bottom: none;
      }
      
      .iconfont {
        font-size: 40rpx;
        color: #FE8C00;
        
        &.icon-right {
          font-size: 32rpx;
          color: #ccc;
        }
      }
      
      .title {
        flex: 1;
        font-size: 28rpx;
        color: #333;
        margin-left: 20rpx;
      }
    }
  }
}

.logout-btn {
  margin: 40rpx 20rpx;
  height: 88rpx;
  line-height: 88rpx;
  background: #fff;
  border-radius: 44rpx;
  text-align: center;
  color: #FF4444;
  font-size: 32rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
  
  &:active {
    opacity: 0.9;
  }
}
</style> 