<template>
  <view class="container">
    <!-- 购物车列表 -->
    <view class="cart-list">
      <view class="cart-item" 
            v-for="item in cartList" 
            :key="item.id">
        <checkbox :checked="selectedIds.includes(item.id)"
                 @click="toggleSelect(item.id)">
        </checkbox>
        <image :src="item.product.image" mode="aspectFill"></image>
        <view class="info">
          <text class="name">{{item.product.name}}</text>
          <text class="price">¥{{item.product.price}}</text>
          <view class="quantity">
            <button class="minus" 
                    :disabled="item.quantity <= 1"
                    @click="updateQuantity(item, -1)">-</button>
            <input type="number" 
                   v-model="item.quantity"
                   @blur="onQuantityBlur(item)"/>
            <button class="plus" 
                    :disabled="item.quantity >= item.product.stock"
                    @click="updateQuantity(item, 1)">+</button>
          </view>
        </view>
        <text class="delete" @click="deleteItem(item)">×</text>
      </view>
    </view>
    
    <!-- 底部结算栏 -->
    <view class="action-bar">
      <view class="select-all">
        <checkbox :checked="isAllSelected"
                 @click="toggleSelectAll">全选</checkbox>
      </view>
      <view class="total">
        <text>合计:</text>
        <text class="price">¥{{totalPrice}}</text>
      </view>
      <button class="submit-btn" 
              :disabled="selectedIds.length === 0"
              @click="submitOrder">
        结算({{selectedIds.length}})
      </button>
    </view>
  </view>
</template>

<script>
import { getCartList, updateCart, deleteCart } from '@/api/cart'

export default {
  data() {
    return {
      cartList: [],
      selectedIds: []
    }
  },
  computed: {
    isAllSelected() {
      return this.cartList.length > 0 && 
             this.selectedIds.length === this.cartList.length
    },
    totalPrice() {
      return this.cartList
        .filter(item => this.selectedIds.includes(item.id))
        .reduce((total, item) => {
          return total + item.product.price * item.quantity
        }, 0)
        .toFixed(2)
    }
  },
  onShow() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const userId = uni.getStorageSync('userInfo').id
        const res = await getCartList()
        if(res.status === 1) {
          this.cartList = res.data
        }
      } catch(e) {
        // 错误处理已在请求拦截器中处理
      }
    },
    toggleSelect(id) {
      const index = this.selectedIds.indexOf(id)
      if(index > -1) {
        this.selectedIds.splice(index, 1)
      } else {
        this.selectedIds.push(id)
      }
    },
    toggleSelectAll() {
      if(this.isAllSelected) {
        this.selectedIds = []
      } else {
        this.selectedIds = this.cartList.map(item => item.id)
      }
    },
    async updateQuantity(item, delta) {
      const newQuantity = item.quantity + delta
      if(newQuantity < 1 || newQuantity > item.product.stock) return
      
      try {
        const res = await updateCart(item.id, {
          ...item,
          quantity: newQuantity
        })
        if(res.status === 1) {
          item.quantity = newQuantity
        }
      } catch(e) {
        // 错误处理已在请求拦截器中处理
      }
    },
    onQuantityBlur(item) {
      const quantity = parseInt(item.quantity)
      if(isNaN(quantity) || quantity < 1) {
        item.quantity = 1
      } else if(quantity > item.product.stock) {
        item.quantity = item.product.stock
      }
      this.updateQuantity(item, 0)
    },
    async deleteItem(item) {
      uni.showModal({
        title: '提示',
        content: '确定要删除该商品吗？',
        success: async (res) => {
          if(res.confirm) {
            try {
              const res = await deleteCart(item.id)
              if(res.status === 1) {
                const index = this.selectedIds.indexOf(item.id)
                if(index > -1) {
                  this.selectedIds.splice(index, 1)
                }
                this.loadData()
              }
            } catch(e) {
              // 错误处理已在请求拦截器中处理
            }
          }
        }
      })
    },
    submitOrder() {
      const selectedItems = this.cartList
        .filter(item => this.selectedIds.includes(item.id))
      
      uni.navigateTo({
        url: `/pages/order/create?items=${JSON.stringify(selectedItems)}`
      })
    }
  }
}
</script>

<style lang="scss">
.container {
  padding-bottom: 100rpx;
}

.cart-list {
  .cart-item {
    display: flex;
    align-items: center;
    padding: 30rpx;
    background: #fff;
    margin-bottom: 2rpx;
    
    checkbox {
      margin-right: 20rpx;
    }
    
    image {
      width: 160rpx;
      height: 160rpx;
      border-radius: 12rpx;
      margin-right: 20rpx;
    }
    
    .info {
      flex: 1;
      
      .name {
        font-size: 28rpx;
        color: #333;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }
      
      .price {
        font-size: 32rpx;
        color: #FF4444;
        margin-top: 16rpx;
      }
      
      .quantity {
        display: flex;
        align-items: center;
        margin-top: 16rpx;
        
        button {
          width: 60rpx;
          height: 60rpx;
          line-height: 60rpx;
          text-align: center;
          border: 1rpx solid #ddd;
          background: #fff;
          font-size: 28rpx;
          color: #333;
          padding: 0;
          
          &[disabled] {
            color: #ccc;
          }
        }
        
        input {
          width: 80rpx;
          height: 60rpx;
          line-height: 60rpx;
          text-align: center;
          border-top: 1rpx solid #ddd;
          border-bottom: 1rpx solid #ddd;
          font-size: 28rpx;
          color: #333;
        }
      }
    }
    
    .delete {
      padding: 20rpx;
      font-size: 40rpx;
      color: #999;
    }
  }
}

.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100rpx;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  
  .select-all {
    margin-right: 30rpx;
  }
  
  .total {
    flex: 1;
    font-size: 28rpx;
    
    .price {
      color: #FF4444;
      font-size: 36rpx;
      font-weight: bold;
      margin-left: 10rpx;
    }
  }
  
  .submit-btn {
    width: 240rpx;
    height: 80rpx;
    line-height: 80rpx;
    background: #FE8C00;
    color: #fff;
    border-radius: 40rpx;
    font-size: 30rpx;
    margin: 0;
    
    &[disabled] {
      background: #ccc;
    }
  }
}
</style> 