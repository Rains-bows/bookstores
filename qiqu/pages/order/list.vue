<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-nav" :style="{ height: navBarHeight + 'px' }">
      <view class="nav-content" :style="{ height: menuHeight + 'px', top: statusBarHeight + 'px' }">
        <view class="back-icon" @click="goBack"></view>
        <text class="title">订单列表</text>
      </view>
    </view>

    <!-- 状态筛选栏 -->
    <view class="status-tabs" :style="statusTabStyle">
      <view 
        class="tab-item" 
        v-for="(item, index) in statusList" 
        :key="index"
        :class="{ active: currentStatus === item.value }"
        @click="changeStatus(item.value)"
      >
        <text>{{ item.name }}</text>
      </view>
    </view>

    <!-- 订单列表 -->
    <scroll-view 
      class="order-list" 
      scroll-y 
      @scrolltolower="loadMore"
      :style="listStyle"
    >
      <view 
        class="order-item"
        v-for="(item, index) in orderList" 
        :key="index"
      >
        <!-- 订单内容 -->
        <view class="order-content">
          <!-- 店铺信息 -->
          <view class="shop-info">
            <text class="shop-name">在线书城</text>
            <text class="order-time">{{ formatDate(item.createdAt) }}</text>
          </view>
          
          <!-- 订单号 -->
          <view class="order-no">
            <text>订单编号：</text>
            <text class="number" @click="copyOrderNo(item.id)">{{ item.id }}</text>
            <text class="copy-btn" @click="copyOrderNo(item.id)">复制</text>
          </view>
          
          <!-- 商品信息 -->
          <view 
            class="product-item"
            v-for="(product, productIndex) in item.products" 
            :key="productIndex"
          >
            <image :src="product.image" mode="aspectFill" class="product-image"/>
            <view class="product-info">
              <text class="product-name">{{ product.name }}</text>
              <view class="product-price-wrap">
                <text class="product-price">¥{{ product.price }}</text>
                <text class="product-count">x{{ product.count }}</text>
              </view>
            </view>
          </view>
          
          <!-- 配送信息 -->
          <view class="delivery-info">
            <text class="type">{{ item.deliveryType === 'express' ? '快递配送' : '自提' }}</text>
            <text class="address" v-if="item.deliveryType === 'express'">{{ item.address }}</text>
            <text class="address" v-else>{{ item.pickupAddress }}</text>
          </view>
          
          <!-- 订单金额 -->
          <view class="order-amount">
            <text>共{{ getTotalCount(item.products) }}件商品</text>
            <text class="amount">实付：¥{{ item.totalAmount }}</text>
          </view>
          
          <!-- 订单状态和操作按钮 -->
          <view class="order-footer">
            <text class="status">{{ getOrderStatus(item) }}</text>
            <view class="buttons">
              <button 
                class="btn outline" 
                v-if="item.status === '已完成'"
                @click="handleBuyAgain(item)"
              >再次购买</button>
              <button 
                class="btn outline" 
                v-if="item.status === '已完成'"
                @click="handleDelete(item)"
              >删除订单</button>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 加载更多 -->
      <view class="load-more" v-if="hasMore">
        <text>加载中...</text>
      </view>
      
      <!-- 无数据提示 -->
      <view class="empty" v-if="orderList.length === 0">
        <image src="/static/images/empty-order.png" mode="aspectFit" class="empty-image"/>
        <text>暂无相关订单</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getOrderList, getOrdersByStatus } from '@/api/order'

export default {
  data() {
    return {
      statusList: [
        { name: '全部', value: '' },
        { name: '待付款', value: '待付款' },
        { name: '待发货', value: '待发货' },
        { name: '已发货', value: '已发货' },
        { name: '已完成', value: '已完成' },
        { name: '已过期', value: '已过期' }
      ],
      currentStatus: '',
      orderList: [],
      page: 1,
      pageSize: 10,
      hasMore: true,
      scrollHeight: 0,
      // 导航栏相关
      statusBarHeight: 0,
      navBarHeight: 0,
      menuHeight: 44
    }
  },
  
  onLoad(options) {
    // 设置状态
    this.currentStatus = options.status || ''
    
    // 获取系统信息设置导航栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
    this.navBarHeight = this.statusBarHeight + this.menuHeight
    
    // 计算滚动区域高度
    this.scrollHeight = systemInfo.windowHeight - this.navBarHeight - 100 // 减去导航栏和状态栏的高度
    this.loadOrders()
  },

  onPullDownRefresh() {
    // 下拉刷新
    this.page = 1
    this.loadOrders().then(() => {
      uni.stopPullDownRefresh()
    })
  },
  
  methods: {
    // 加载订单列表
    async loadOrders() {
      try {
        uni.showLoading({
          title: '加载中'
        })
        
        // 根据状态获取订单
        const res = this.currentStatus ? 
          await getOrdersByStatus(this.currentStatus) : 
          await getOrderList()

        if(res.code === 1) {
          this.orderList = res.data || []
        } else {
          throw new Error(res.message || '获取订单列表失败')
        }
      } catch(e) {
        console.error('获取订单列表失败:', e)
        uni.showToast({
          title: e.message || '获取订单列表失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    // 切换订单状态
    changeStatus(status) {
      if(this.currentStatus === status) return
      this.currentStatus = status
      this.orderList = [] // 清空当前列表
      this.loadOrders()
    },
    
    // 加载更多
    loadMore() {
      if(this.hasMore) {
        this.page++
        this.loadOrders()
      }
    },
    
    // 删除订单
    handleDelete(item) {
      uni.showModal({
        title: '提示',
        content: '确定要删除该订单吗？',
        success: async (res) => {
          if(res.confirm) {
            try {
              const res = await deleteOrder(item.id)
              if(res.code === 1) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                // 重新加载订单列表
                this.page = 1
                this.loadOrders()
              }
            } catch(e) {
              console.error('删除订单失败:', e)
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    
    // 再次购买
    handleBuyAgain(item) {
      // 实现再次购买逻辑
    },
    
    // 格式化日期
    formatDate(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    },
    
    // 获取商品总数
    getTotalCount(products) {
      if (!Array.isArray(products)) return 0
      return products.reduce((total, product) => total + (product.count || 0), 0)
    },
    
    // 复制订单号
    copyOrderNo(orderNo) {
      uni.setClipboardData({
        data: orderNo,
        success: () => {
          uni.showToast({
            title: '订单号已复制',
            icon: 'none'
          })
        }
      })
    },
    
    // 返回上一页
    goBack() {
      if (getCurrentPages().length > 1) {
        uni.navigateBack()
      } else {
        uni.reLaunch({
          url: '/pages/mall/mall'
        })
      }
    },
    
    // 获取订单状态显示文本
    getOrderStatus(item) {
      if (item.status === '待付款') {
        // 检查订单是否过期 (假设订单有效期为30分钟)
        const orderTime = new Date(item.createdAt).getTime()
        const now = new Date().getTime()
        const EXPIRE_TIME = 30 * 60 * 1000 // 30分钟
        
        if (now - orderTime > EXPIRE_TIME) {
          return '订单已过期'
        }
      }
      return item.status
    },

    onBackPress() {
      // 监听返回按键事件，返回到商城首页
      uni.reLaunch({
        url: '/pages/mall/mall'
      })
      return true // 返回true，表示已处理返回事件
    }
  },

  // 在页面卸载时清除CSS变量
  onUnload() {
    document.documentElement.style.removeProperty('--custom-nav-height')
  },

  computed: {
    // 计算状态栏的样式
    statusTabStyle() {
        return {
            top: this.navBarHeight + 'px'
        }
    },
    
    // 计算列表的样式
    listStyle() {
        return {
            paddingTop: (this.navBarHeight + 100) + 'px'
        }
    }
  }
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: #f8f8f8;
}

/* 自定义导航栏样式 */
.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #fff;
  z-index: 99;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
  
  .nav-content {
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    
    .back-icon {
      width: 70rpx;
      height: 70rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      margin-left: -20rpx;
      
      &::before {
        content: '';
        width: 20rpx;
        height: 20rpx;
        border-left: 4rpx solid #333;
        border-bottom: 4rpx solid #333;
        transform: rotate(45deg);
        margin-right: -6rpx;
      }
    }
    
    .title {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }
}

.status-tabs {
  display: flex;
  padding: 20rpx 30rpx;
  background: #fff;
  position: fixed;
  left: 0;
  right: 0;
  z-index: 98;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
}

.tab-item {
  flex: 1;
  text-align: center;
  position: relative;
  padding: 16rpx 0;
}

.tab-item text {
  font-size: 28rpx;
  color: #333;  /* 修改默认字体颜色 */
  transition: all 0.3s;
}

.tab-item.active text {
  color: #FE8C00;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background: #FE8C00;
  border-radius: 2rpx;
}

.order-list {
  box-sizing: border-box;
  padding-left: 30rpx;
  padding-right: 30rpx;
  padding-bottom: 30rpx;
}

.order-item {
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}

.shop-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.shop-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.order-time {
  font-size: 24rpx;
  color: #999;
}

.order-no {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 2rpx solid #f5f5f5;
  font-size: 24rpx;
  color: #666;
}

.order-no .number {
  color: #333;
  margin: 0 20rpx 0 10rpx;
}

.order-no .copy-btn {
  color: #ff4d6a;
  font-size: 24rpx;
}

.product-item {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #f5f5f5;
}

.product-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 8rpx;
  background: #f5f5f5;
}

.product-info {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 28rpx;
  color: #333;
  line-height: 1.4;
}

.product-price-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 32rpx;
  color: #FE8C00;
  font-weight: 500;
}

.product-count {
  font-size: 26rpx;
  color: #999;
}

.delivery-info {
  padding: 20rpx 0;
  border-bottom: 2rpx solid #f5f5f5;
}

.delivery-info .type {
  font-size: 26rpx;
  color: #666;
  margin-right: 20rpx;
}

.delivery-info .address {
  font-size: 26rpx;
  color: #333;
}

.order-amount {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #f5f5f5;
}

.order-amount text {
  font-size: 26rpx;
  color: #666;
}

.order-amount .amount {
  margin-left: 20rpx;
  color: #FE8C00;
  font-weight: 500;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
}

.order-footer .status {
  font-size: 28rpx;
  color: #FE8C00;
  font-weight: 500;
}

.buttons {
  display: flex;
  gap: 20rpx;
}

.btn {
  min-width: 160rpx;
  height: 64rpx;
  line-height: 64rpx;
  text-align: center;
  border-radius: 32rpx;
  font-size: 26rpx;
  background: #FE8C00;
  color: #fff;
  margin: 0;
  padding: 0 30rpx;
  border: none;
}

.btn.outline {
  background: #fff;
  color: #666;
  border: 2rpx solid #ddd;
}

.empty {
  padding: 120rpx 0;
  text-align: center;
  
  .empty-image {
    width: 240rpx;
    height: 240rpx;
    margin-bottom: 20rpx;
  }
  
  text {
    font-size: 28rpx;
    color: #999;
  }
}

.load-more {
  text-align: center;
  padding: 30rpx 0;
  color: #999;
  font-size: 24rpx;
}
</style> 