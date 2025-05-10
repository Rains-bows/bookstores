<template>
  <view class="container">
    <!-- 购物车列表 -->
    <scroll-view scroll-y class="cart-list" v-if="cartList.length > 0">
      <view 
        class="cart-item"
        v-for="(item, index) in cartList"
        :key="item.id"
      >
        <view class="select-wrap" @tap="toggleSelect(item)">
          <view class="select-icon" :class="{ active: item.selected }">
            <text class="iconfont icon-check" v-if="item.selected"></text>
          </view>
        </view>
        <image 
          :src="item.productInfo?.image || '/static/images/default.png'" 
          mode="aspectFill" 
          class="product-image"
          @tap="goToDetail(item.productId)"
        />
        <view class="product-info">
          <text class="name" @tap="goToDetail(item.productId)">{{ item.productInfo?.name || '商品已下架' }}</text>
          <view class="price-wrap">
            <text class="price">¥{{ item.productInfo?.price || '0.00' }}</text>
            <view class="quantity-control">
              <text 
                class="minus" 
                :class="{ disabled: item.quantity <= 1 }"
                @tap="updateQuantity(item, -1)"
              >-</text>
              <input 
                type="number" 
                v-model="item.quantity"
                @blur="handleQuantityInput(item)"
              />
              <text 
                class="plus"
                @tap="updateQuantity(item, 1)"
              >+</text>
            </view>
          </view>
        </view>
        <text class="delete-btn" @tap="deleteItem(item)">×</text>
      </view>
    </scroll-view>
    
    <!-- 空购物车 -->
    <view class="empty" v-else>
      <image src="/static/images/empty-cart.png" mode="aspectFit" class="empty-image"/>
      <text>购物车还是空的</text>
      <button class="go-shopping" @tap="goShopping">去逛逛</button>
    </view>
    
    <!-- 底部结算栏 -->
    <view class="footer" v-if="cartList.length > 0">
      <view class="select-all" @tap="toggleSelectAll">
        <view class="select-icon" :class="{ active: isAllSelected }">
          <text class="iconfont icon-check" v-if="isAllSelected"></text>
        </view>
        <text>全选</text>
      </view>
      <view class="total">
        <text>合计：</text>
        <text class="price">¥{{ totalPrice }}</text>
      </view>
      <button 
        class="checkout-btn"
        :disabled="selectedCount === 0"
        @tap="checkout"
      >
        结算({{ selectedCount }})
      </button>
    </view>
  </view>
</template>

<script>
import { getCartByUserId, updateCart, deleteCart } from '@/api/cart'
import { getProductDetail } from '@/api/product'
import { getCurrentUser } from '@/api/user'

export default {
  data() {
    return {
      cartList: [],
      loading: false,
      userInfo: null
    }
  },
  
  computed: {
    // 是否全选
    isAllSelected() {
      return this.cartList.length > 0 && this.cartList.every(item => item.selected)
    },
    
    // 选中的商品数量
    selectedCount() {
      return this.cartList.filter(item => item.selected).length
    },
    
    // 总价
    totalPrice() {
      return this.cartList
        .filter(item => item.selected)
        .reduce((total, item) => total + (item.productInfo?.price || 0) * item.quantity, 0)
        .toFixed(2)
    }
  },
  
  onShow() {
    this.checkUserAndLoadCart()
  },
  
  methods: {
    // 检查用户登录状态并加载购物车
    async checkUserAndLoadCart() {
      try {
        // 获取当前用户信息
        const userRes = await getCurrentUser()
        if (userRes.code === 1 && userRes.data) {
          this.userInfo = userRes.data
          // 存储用户信息
          uni.setStorageSync('userInfo', userRes.data)
          // 加载购物车
          await this.loadCartList()
        } else {
          // 未登录，跳转到登录页
          uni.navigateTo({
            url: '/pages/login/login'
          })
        }
      } catch (e) {
        console.error('获取用户信息失败:', e)
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
        // 跳转到登录页
        uni.navigateTo({
          url: '/pages/login/login'
        })
      }
    },
    
    // 加载购物车列表
    async loadCartList() {
      if (!this.userInfo || !this.userInfo.id) {
        console.error('用户未登录')
        return
      }
      
      try {
        uni.showLoading({
          title: '加载中'
        })
        
        const res = await getCartByUserId(this.userInfo.id)
        
        if (res.code === 1) {
          this.cartList = res.data || []
          // 获取每个商品的详细信息
          await this.loadProductDetails()
        } else {
          throw new Error(res.message || '获取购物车失败')
        }
      } catch (e) {
        console.error('获取购物车失败:', e)
        uni.showToast({
          title: e.message || '获取购物车失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    // 获取商品详细信息
    async loadProductDetails() {
      const promises = this.cartList.map(async (item) => {
        try {
          const res = await getProductDetail(item.productId)
          if (res.code === 1) {
            item.productInfo = res.data
          }
        } catch (e) {
          console.error(`获取商品${item.productId}详情失败:`, e)
          item.productInfo = null
        }
      })
      
      await Promise.all(promises)
    },
    
    // 切换选中状态
    async toggleSelect(item) {
      try {
        const updatedItem = {
          ...item,
          selected: !item.selected
        }
        
        const res = await updateCart(item.id, updatedItem)
        if (res.code === 1) {
          const index = this.cartList.findIndex(i => i.id === item.id)
          if (index !== -1) {
            this.cartList[index].selected = !item.selected
          }
        } else {
          throw new Error(res.message || '更新失败')
        }
      } catch (e) {
        console.error('更新购物车失败:', e)
        uni.showToast({
          title: e.message || '更新失败',
          icon: 'none'
        })
      }
    },
    
    // 切换全选状态
    async toggleSelectAll() {
      const newSelected = !this.isAllSelected
      try {
        for (const item of this.cartList) {
          if (item.selected !== newSelected) {
            await updateCart(item.id, { ...item, selected: newSelected })
            item.selected = newSelected
          }
        }
      } catch (e) {
        console.error('更新购物车失败:', e)
        uni.showToast({
          title: '更新失败',
          icon: 'none'
        })
      }
    },
    
    // 更新商品数量
    async updateQuantity(item, delta) {
      if (!this.userInfo) return
      
      const newQuantity = item.quantity + delta
      if (newQuantity < 1) return
      
      try {
        const updatedItem = {
          ...item,
          quantity: newQuantity,
          userId: this.userInfo.id
        }
        
        const res = await updateCart(item.id, updatedItem)
        if (res.code === 1) {
          const index = this.cartList.findIndex(i => i.id === item.id)
          if (index !== -1) {
            this.cartList[index].quantity = newQuantity
          }
        } else {
          throw new Error(res.message || '更新失败')
        }
      } catch (e) {
        console.error('更新购物车失败:', e)
        uni.showToast({
          title: e.message || '更新失败',
          icon: 'none'
        })
      }
    },
    
    // 处理数量输入
    async handleQuantityInput(item) {
      const quantity = parseInt(item.quantity)
      if (isNaN(quantity) || quantity < 1) {
        item.quantity = 1
      }
      await this.updateQuantity(item, 0)
    },
    
    // 删除商品
    async deleteItem(item) {
      if (!this.userInfo) return
      
      uni.showModal({
        title: '提示',
        content: '确定要删除该商品吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const res = await deleteCart(item.id)
              if (res.code === 1) {
                const index = this.cartList.findIndex(i => i.id === item.id)
                if (index !== -1) {
                  this.cartList.splice(index, 1)
                }
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
              } else {
                throw new Error(res.message || '删除失败')
              }
            } catch (e) {
              console.error('删除购物车商品失败:', e)
              uni.showToast({
                title: e.message || '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    
    // 去结算
    checkout() {
      const selectedItems = this.cartList.filter(item => item.selected)
      if (selectedItems.length === 0) {
        return uni.showToast({
          title: '请选择商品',
          icon: 'none'
        })
      }
      
      uni.navigateTo({
        url: '/pages/order/create?from=cart'
      })
    },
    
    // 去购物
    goShopping() {
      uni.switchTab({
        url: '/pages/mall/mall'
      })
    },
    
    // 跳转到商品详情
    goToDetail(productId) {
      uni.navigateTo({
        url: `/pages/product/detail?id=${productId}`
      })
    }
  }
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.cart-list {
  padding: 20rpx;
}

.cart-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  margin-bottom: 20rpx;
  position: relative;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.03);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
  
  .select-wrap {
    padding: 20rpx;
    margin-left: -10rpx;
  }
  
  .select-icon {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    border: 2rpx solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    
    &.active {
      background: #FE8C00;
      border-color: #FE8C00;
    }
    
    .icon-check {
      color: #fff;
      font-size: 24rpx;
    }
  }
  
  .product-image {
    width: 180rpx;
    height: 180rpx;
    border-radius: 12rpx;
    background: #f5f5f5;
    transition: transform 0.3s ease;
    
    &:active {
      transform: scale(0.95);
    }
  }
  
  .product-info {
    flex: 1;
    margin-left: 24rpx;
    
    .name {
      font-size: 28rpx;
      color: #333;
      line-height: 1.4;
      margin-bottom: 24rpx;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
    
    .price-wrap {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .price {
        font-size: 36rpx;
        color: #FE8C00;
        font-weight: bold;
      }
      
      .quantity-control {
        display: flex;
        align-items: center;
        border: 2rpx solid #eee;
        border-radius: 32rpx;
        padding: 4rpx;
        background: #fff;
        box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.02);
        
        text {
          width: 64rpx;
          height: 56rpx;
          line-height: 56rpx;
          text-align: center;
          font-size: 36rpx;
          color: #333;
          transition: all 0.2s ease;
          
          &.disabled {
            color: #ccc;
          }
          
          &:active {
            background: #f8f8f8;
          }
        }
        
        input {
          width: 80rpx;
          height: 56rpx;
          line-height: 56rpx;
          text-align: center;
          font-size: 28rpx;
          background: transparent;
        }
      }
    }
  }
  
  .delete-btn {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    width: 44rpx;
    height: 44rpx;
    line-height: 44rpx;
    text-align: center;
    font-size: 44rpx;
    color: #999;
    transition: all 0.2s ease;
    
    &:active {
      transform: scale(0.9);
      color: #ff4d4f;
    }
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 240rpx;
  
  .empty-image {
    width: 280rpx;
    height: 280rpx;
    margin-bottom: 40rpx;
  }
  
  text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 48rpx;
  }
  
  .go-shopping {
    width: 280rpx;
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(135deg, #FE8C00, #F7B500);
    color: #fff;
    font-size: 32rpx;
    font-weight: 500;
    border-radius: 44rpx;
    box-shadow: 0 8rpx 16rpx rgba(254,140,0,0.2);
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.95);
      box-shadow: 0 4rpx 8rpx rgba(254,140,0,0.1);
    }
  }
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100rpx;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -2rpx 20rpx rgba(0,0,0,0.05);
  
  .select-all {
    display: flex;
    align-items: center;
    
    .select-icon {
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      border: 2rpx solid #ddd;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      
      &.active {
        background: #FE8C00;
        border-color: #FE8C00;
      }
      
      .icon-check {
        color: #fff;
        font-size: 24rpx;
      }
    }
    
    text {
      font-size: 28rpx;
      color: #333;
      margin-left: 12rpx;
    }
  }
  
  .total {
    flex: 1;
    text-align: right;
    margin-right: 30rpx;
    
    text {
      font-size: 28rpx;
      color: #333;
    }
    
    .price {
      font-size: 40rpx;
      color: #FE8C00;
      font-weight: bold;
    }
  }
  
  .checkout-btn {
    min-width: 220rpx;
    height: 80rpx;
    line-height: 80rpx;
    background: linear-gradient(135deg, #FE8C00, #F7B500);
    color: #fff;
    font-size: 32rpx;
    font-weight: 500;
    border-radius: 40rpx;
    box-shadow: 0 8rpx 16rpx rgba(254,140,0,0.2);
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.95);
      box-shadow: 0 4rpx 8rpx rgba(254,140,0,0.1);
    }
    
    &[disabled] {
      background: #ccc;
      box-shadow: none;
    }
  }
}
</style>