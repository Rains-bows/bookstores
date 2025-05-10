<template>
  <view class="container">
    <!-- 地址列表 -->
    <view class="address-list">
      <view 
        class="address-item"
        v-for="item in addressList"
        :key="item.id"
        @click="isSelectMode ? selectAddress(item) : null"
      >
        <view class="info">
          <view class="user">
            <text class="name">{{ item.recipientName }}</text>
            <text class="phone">{{ item.phone }}</text>
          </view>
          <view class="address">{{ item.address }}</view>
        </view>
        <view class="actions">
          <text class="edit" @click.stop="editAddress(item)">编辑</text>
          <text class="delete" @click.stop="deleteAddress(item.id)">删除</text>
        </view>
      </view>
    </view>
    
    <!-- 空状态 -->
    <view class="empty" v-if="addressList.length === 0">
      <text>暂无收货地址</text>
    </view>
    
    <!-- 添加按钮 -->
    <button class="add-btn" @click="addAddress">新增地址</button>
  </view>
</template>

<script>
import { getAddressList, deleteAddress } from '@/api/address'

export default {
  data() {
    return {
      addressList: [],
      loading: false,
      isSelectMode: false
    }
  },

  onLoad(options) {
    // 判断是否是选择地址模式
    this.isSelectMode = options.select === 'true'
    // 立即加载地址列表
    this.getAddresses()
  },

  onShow() {
    this.getAddresses()
  },

  methods: {
    async getAddresses() {
      if (this.loading) return
      this.loading = true
      
      uni.showLoading({
        title: '加载中'
      })
      
      try {
        const userInfo = uni.getStorageSync('userInfo')
        if(!userInfo) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
          return
        }
        
        const res = await getAddressList(userInfo.id)
        if(res.code === 1) {
          // 对地址列表进行排序，默认地址排在最前面
          this.addressList = (res.data || []).sort((a, b) => {
            if (a.isDefault && !b.isDefault) return -1
            if (!a.isDefault && b.isDefault) return 1
            return 0
          })
        } else {
          throw new Error(res.message || '获取地址列表失败')
        }
      } catch(e) {
        console.error('获取地址列表失败:', e)
        uni.showToast({
          title: e.message || '获取地址列表失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
        uni.hideLoading()
      }
    },

    // 选择地址
    selectAddress(address) {
      // 发送选择事件
      uni.$emit('addressSelected', address)
      // 返回上一页
      uni.navigateBack()
    },

    // 编辑地址
    editAddress(address) {
      uni.navigateTo({
        url: `/pages/address/edit?id=${address.id}`
      })
    },

    // 添加地址
    addAddress() {
      uni.navigateTo({
        url: '/pages/address/edit'
      })
    },

    // 删除地址
    async deleteAddress(id) {
      uni.showModal({
        title: '提示',
        content: '确定要删除该地址吗？',
        success: async (res) => {
          if(res.confirm) {
            uni.showLoading({
              title: '删除中'
            })
            
            try {
              const res = await deleteAddress(id)
              if(res.code === 1) {
                // 直接从列表中移除，无需重新请求
                this.addressList = this.addressList.filter(item => item.id !== id)
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
              } else {
                throw new Error(res.message || '删除失败')
              }
            } catch(e) {
              console.error('删除地址失败:', e)
              uni.showToast({
                title: e.message || '删除失败',
                icon: 'none'
              })
            } finally {
              uni.hideLoading()
            }
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
  background: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.address-list {
  .address-item {
    background: #fff;
    border-radius: 12rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    position: relative;
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.98);
      opacity: 0.8;
    }
    
    .info {
      margin-bottom: 20rpx;
      
      .user {
        margin-bottom: 10rpx;
        
        .name {
          font-size: 32rpx;
          color: #333;
          margin-right: 20rpx;
        }
        
        .phone {
          font-size: 28rpx;
          color: #666;
        }
      }
      
      .address {
        font-size: 28rpx;
        color: #666;
        line-height: 1.5;
      }
    }
    
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 20rpx;
      
      text {
        font-size: 28rpx;
        padding: 10rpx 20rpx;
        border-radius: 4rpx;
        
        &.edit {
          color: #FE8C00;
          background: rgba(254, 140, 0, 0.1);
          
          &:active {
            background: rgba(254, 140, 0, 0.2);
          }
        }
        
        &.delete {
          color: #FF4444;
          background: rgba(255, 68, 68, 0.1);
          
          &:active {
            background: rgba(255, 68, 68, 0.2);
          }
        }
      }
    }
  }
}

.empty {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}

.add-btn {
  position: fixed;
  left: 30rpx;
  right: 30rpx;
  bottom: 30rpx;
  height: 90rpx;
  line-height: 90rpx;
  background: #FE8C00;
  color: #fff;
  border-radius: 45rpx;
  font-size: 32rpx;
  
  &:active {
    opacity: 0.9;
  }
}
</style> 