<template>
  <view class="container">
    <!-- 头部背景 -->
    <view class="header-bg">
      <image src="/static/images/settings-bg.png" mode="aspectFill" />
    </view>
    
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <image :src="userInfo.avatar || '/static/images/default-avatar.png'" class="avatar" mode="aspectFill" />
      <view class="info">
        <text class="nickname">{{ userInfo.nickname || userInfo.username }}</text>
        <text class="username">账号：{{ userInfo.username }}</text>
      </view>
    </view>
    
    <!-- 设置列表 -->
    <view class="settings-list">
      <!-- 个人资料设置 -->
      <view class="settings-group">
        <view class="group-title">个人资料</view>
        <view class="settings-item" @click="navigateTo('/pages/user/profile')">
          <view class="item-left">
            <text class="iconfont icon-user"></text>
            <text>个人信息</text>
          </view>
          <view class="item-right">
            <text class="hint">修改头像、昵称等</text>
            <text class="iconfont icon-right"></text>
          </view>
        </view>
        <view class="settings-item" @click="navigateTo('/pages/address/list')">
          <view class="item-left">
            <text class="iconfont icon-location"></text>
            <text>收货地址</text>
          </view>
          <view class="item-right">
            <text class="iconfont icon-right"></text>
          </view>
        </view>
      </view>
      
      <!-- 安全设置 -->
      <view class="settings-group">
        <view class="group-title">安全设置</view>
        <view class="settings-item" @click="navigateTo('/pages/user/password')">
          <view class="item-left">
            <text class="iconfont icon-lock"></text>
            <text>修改密码</text>
          </view>
          <view class="item-right">
            <text class="iconfont icon-right"></text>
          </view>
        </view>
        <view class="settings-item" @click="navigateTo('/pages/user/phone')">
          <view class="item-left">
            <text class="iconfont icon-phone"></text>
            <text>绑定手机</text>
          </view>
          <view class="item-right">
            <text class="hint">{{ userInfo.phone || '未绑定' }}</text>
            <text class="iconfont icon-right"></text>
          </view>
        </view>
        <view class="settings-item" @click="navigateTo('/pages/user/email')">
          <view class="item-left">
            <text class="iconfont icon-email"></text>
            <text>绑定邮箱</text>
          </view>
          <view class="item-right">
            <text class="hint">{{ userInfo.email || '未绑定' }}</text>
            <text class="iconfont icon-right"></text>
          </view>
        </view>
      </view>
      
      <!-- 通知设置 -->
      <view class="settings-group">
        <view class="group-title">通知设置</view>
        <view class="settings-item">
          <view class="item-left">
            <text class="iconfont icon-notification"></text>
            <text>推送通知</text>
          </view>
          <view class="item-right">
            <switch :checked="notificationEnabled" @change="toggleNotification" color="#FE8C00" />
          </view>
        </view>
        <view class="settings-item">
          <view class="item-left">
            <text class="iconfont icon-sound"></text>
            <text>声音提醒</text>
          </view>
          <view class="item-right">
            <switch :checked="soundEnabled" @change="toggleSound" color="#FE8C00" />
          </view>
        </view>
      </view>
      
      <!-- 其他设置 -->
      <view class="settings-group">
        <view class="group-title">其他设置</view>
        <view class="settings-item" @click="clearCache">
          <view class="item-left">
            <text class="iconfont icon-clear"></text>
            <text>清除缓存</text>
          </view>
          <view class="item-right">
            <text class="hint">{{ cacheSize }}</text>
            <text class="iconfont icon-right"></text>
          </view>
        </view>
        <view class="settings-item" @click="navigateTo('/pages/about/index')">
          <view class="item-left">
            <text class="iconfont icon-info"></text>
            <text>关于我们</text>
          </view>
          <view class="item-right">
            <text class="iconfont icon-right"></text>
          </view>
        </view>
      </view>
      
      <!-- 退出登录 -->
      <view class="logout-btn" @click="handleLogout">
        退出登录
      </view>
    </view>
  </view>
</template>

<script>
import { getCurrentUser } from '@/api/user'

export default {
  data() {
    return {
      userInfo: {
        username: '',
        phone: '',
        email: '',
        avatar: '',
        nickname: ''
      },
      notificationEnabled: true,
      soundEnabled: true,
      cacheSize: '0MB'
    }
  },
  
  onShow() {
    this.loadUserInfo()
    this.loadSettings()
    this.calculateCacheSize()
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
    
    // 加载设置
    loadSettings() {
      const settings = uni.getStorageSync('settings') || {}
      this.notificationEnabled = settings.notification !== false
      this.soundEnabled = settings.sound !== false
    },
    
    // 计算缓存大小
    calculateCacheSize() {
      // 模拟计算缓存大小
      setTimeout(() => {
        this.cacheSize = '2.5MB'
      }, 500)
    },
    
    // 页面跳转
    navigateTo(url) {
      uni.navigateTo({ url })
    },
    
    // 切换推送通知
    toggleNotification(e) {
      this.notificationEnabled = e.detail.value
      this.saveSettings()
    },
    
    // 切换声音提醒
    toggleSound(e) {
      this.soundEnabled = e.detail.value
      this.saveSettings()
    },
    
    // 保存设置
    saveSettings() {
      const settings = {
        notification: this.notificationEnabled,
        sound: this.soundEnabled
      }
      uni.setStorageSync('settings', settings)
    },
    
    // 清除缓存
    clearCache() {
      uni.showModal({
        title: '提示',
        content: '确定要清除缓存吗？',
        success: (res) => {
          if(res.confirm) {
            uni.showLoading({
              title: '清理中'
            })
            
            setTimeout(() => {
              uni.hideLoading()
              this.cacheSize = '0MB'
              uni.showToast({
                title: '清除成功',
                icon: 'success'
              })
            }, 1000)
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
            // 清除用户信息和token
            uni.removeStorageSync('userInfo')
            uni.removeStorageSync('token')
            uni.removeStorageSync('settings')
            
            // 返回登录页
            uni.reLaunch({
              url: '/pages/login/index'
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

.header-bg {
  height: 240rpx;
  overflow: hidden;
  position: relative;
  
  image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 60rpx;
    background: linear-gradient(to top, #f8f8f8, transparent);
  }
}

.settings-list {
  margin-top: -40rpx;
  position: relative;
  z-index: 1;
  padding: 0 20rpx;
}

.settings-group {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  padding: 0 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);
  
  .group-title {
    padding: 24rpx 0;
    font-size: 28rpx;
    color: #999;
  }
  
  .settings-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 0;
    border-top: 1rpx solid #f5f5f5;
    
    .item-left {
      display: flex;
      align-items: center;
      
      .iconfont {
        font-size: 40rpx;
        color: #FE8C00;
        margin-right: 20rpx;
      }
      
      text {
        font-size: 28rpx;
        color: #333;
      }
    }
    
    .item-right {
      display: flex;
      align-items: center;
      
      .hint {
        font-size: 24rpx;
        color: #999;
        margin-right: 10rpx;
      }
      
      .iconfont {
        font-size: 32rpx;
        color: #ccc;
      }
    }
  }
}

.logout-btn {
  margin: 40rpx 20rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background: #fff;
  border-radius: 44rpx;
  font-size: 30rpx;
  color: #FF4444;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);
  
  &:active {
    opacity: 0.8;
  }
}

.user-card {
  margin: -80rpx 40rpx 30rpx;
  padding: 30rpx;
  background: #fff;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
  position: relative;
  z-index: 2;
  
  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 60rpx;
    margin-right: 30rpx;
    border: 4rpx solid #fff;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
  }
  
  .info {
    flex: 1;
    
    .nickname {
      font-size: 32rpx;
      color: #333;
      font-weight: bold;
      margin-bottom: 10rpx;
      display: block;
    }
    
    .username {
      font-size: 24rpx;
      color: #999;
    }
  }
}
</style> 