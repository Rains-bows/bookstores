<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-box">
      <input 
        type="text" 
        v-model="keyword"
        placeholder="请输入商品名称搜索"
        class="search-input"
      />
      <button @tap="handleSearch" class="search-btn">搜索</button>
      <button 
        v-if="isSearching" 
        @tap="resetSearch" 
        class="reset-btn"
      >重置</button>
    </view>
    
    <!-- 添加商品按钮 -->
    <button @tap="navigateToAdd" class="add-btn">添加商品</button>
    
    <!-- 商品列表 -->
    <view class="product-list">
      <view v-for="item in products" :key="item.id" class="product-item">
        <view class="product-info">
          <text class="product-name">{{item.name}}</text>
          <text class="product-price">￥{{item.price}}</text>
        </view>
        <view class="product-actions">
          <button @tap="handleEdit(item)" class="btn edit-btn">编辑</button>
          <button @tap="handleDelete(item.id)" class="btn delete-btn">删除</button>
        </view>
      </view>
    </view>
    
    <!-- 分页器 -->
    <view class="pagination">
      <button 
        :disabled="currentPage <= 1"
        @tap="handlePageChange(currentPage - 1)"
        class="page-btn"
      >上一页</button>
      <text class="page-text">第 {{currentPage}} 页</text>
      <button 
        @tap="handlePageChange(currentPage + 1)"
        class="page-btn"
      >下一页</button>
    </view>
  </view>
</template>

<script>
import { getProductsByPage, deleteProduct, searchProducts } from '@/api/product.js'

export default {
  data() {
    return {
      products: [],
      currentPage: 1,
      pageSize: 10,
      keyword: '',
      total: 0,
      isSearching: false
    }
  },
  
  onLoad() {
    this.loadProducts()
  },
  
  onShow() {
    this.loadProducts()
  },
  
  methods: {
    async loadProducts() {
      try {
        const res = this.isSearching 
          ? await searchProducts(this.keyword, this.currentPage, this.pageSize)
          : await getProductsByPage(this.currentPage, this.pageSize)
        if (res.code === 1) {
          this.products = res.data
        } else {
          uni.showToast({
            title: res.message || '获取商品列表失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.showToast({
          title: '获取商品列表失败',
          icon: 'none'
        })
      }
    },
    
    async handleSearch() {
      if (!this.keyword.trim()) {
        this.isSearching = false
        this.currentPage = 1
        this.loadProducts()
        return
      }
      
      try {
        this.isSearching = true
        this.currentPage = 1
        const res = await searchProducts(this.keyword, this.currentPage, this.pageSize)
        if (res.code === 1) {
          this.products = res.data
        }
      } catch (error) {
        uni.showToast({
          title: '搜索失败',
          icon: 'none'
        })
      }
    },
    
    navigateToAdd() {
      uni.navigateTo({
        url: '/pages/product/edit'
      })
    },
    
    handleEdit(item) {
      uni.navigateTo({
        url: `/pages/product/edit?id=${item.id}`
      })
    },
    
    async handleDelete(id) {
      uni.showModal({
        title: '提示',
        content: '确定要删除该商品吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const res = await deleteProduct(id)
              if (res.code === 1) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                await this.loadProducts()
              } else {
                uni.showToast({
                  title: res.message || '删除失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    
    handlePageChange(page) {
      this.currentPage = page
      this.loadProducts()
    },
    
    resetSearch() {
      this.keyword = ''
      this.isSearching = false
      this.currentPage = 1
      this.loadProducts()
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
}

.search-box {
  display: flex;
  margin-bottom: 20rpx;
  
  .search-input {
    flex: 1;
    height: 80rpx;
    border: 1px solid #ddd;
    border-radius: 8rpx;
    padding: 0 20rpx;
    margin-right: 20rpx;
  }
  
  .search-btn {
    width: 160rpx;
    height: 80rpx;
    line-height: 80rpx;
    background-color: #007AFF;
    color: #fff;
    border-radius: 8rpx;
  }
  
  .reset-btn {
    width: 160rpx;
    height: 80rpx;
    line-height: 80rpx;
    background-color: #999;
    color: #fff;
    border-radius: 8rpx;
    margin-left: 20rpx;
  }
}

.add-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #07c160;
  color: #fff;
  margin-bottom: 20rpx;
}

.product-list {
  .product-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx;
    border-bottom: 1px solid #eee;
    
    .product-info {
      flex: 1;
      
      .product-name {
        font-size: 32rpx;
        color: #333;
        margin-bottom: 10rpx;
      }
      
      .product-price {
        font-size: 28rpx;
        color: #f00;
      }
    }
    
    .product-actions {
      display: flex;
      gap: 20rpx;
      
      .btn {
        min-width: 120rpx;
        height: 60rpx;
        line-height: 60rpx;
        font-size: 28rpx;
      }
      
      .edit-btn {
        background-color: #007AFF;
        color: #fff;
      }
      
      .delete-btn {
        background-color: #f00;
        color: #fff;
      }
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20rpx;
  
  .page-btn {
    width: 160rpx;
    height: 60rpx;
    line-height: 60rpx;
    font-size: 28rpx;
  }
  
  .page-text {
    margin: 0 20rpx;
    font-size: 28rpx;
  }
}
</style> 