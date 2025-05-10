<template>
  <view class="container">
    <!-- 商品列表 -->
    <view class="product-list">
      <view class="product-item" 
            v-for="item in products" 
            :key="item.id"
            @click="goDetail(item)">
        <image :src="item.image" mode="aspectFill"></image>
        <view class="info">
          <text class="name">{{item.name}}</text>
          <text class="price">¥{{item.price}}</text>
          <text class="stock">库存: {{item.stock}}</text>
        </view>
      </view>
    </view>
    
    <!-- 加载更多 -->
    <uni-load-more :status="loadMoreStatus"></uni-load-more>
  </view>
</template>

<script>
import { getProductList, getCategoryWithProducts } from '@/api/product'

export default {
  data() {
    return {
      categoryId: '',
      products: [],
      pageNum: 1,
      pageSize: 10,
      loadMoreStatus: 'more'
    }
  },
  onLoad(options) {
    if(options.categoryId) {
      this.categoryId = options.categoryId
    }
    this.loadData()
  },
  methods: {
    async loadData(type = 'refresh') {
      if(type === 'refresh') {
        this.pageNum = 1
        this.products = []
      }
      
      try {
        let res
        if(this.categoryId) {
          res = await getCategoryWithProducts(this.categoryId)
          if(res.status === 1) {
            const products = res.data.products || []
            if(type === 'refresh') {
              this.products = products
            } else {
              this.products = [...this.products, ...products]
            }
            this.loadMoreStatus = 'noMore'
          }
        } else {
          res = await getProductList({
            pageNum: this.pageNum,
            pageSize: this.pageSize
          })
          if(res.status === 1) {
            const { data } = res
            if(type === 'refresh') {
              this.products = data
            } else {
              this.products = [...this.products, ...data]
            }
            this.loadMoreStatus = data.length < this.pageSize ? 'noMore' : 'more'
          }
        }
      } catch(e) {
        this.loadMoreStatus = 'more'
      }
    },
    goDetail(item) {
      uni.navigateTo({
        url: `/pages/product/detail?id=${item.id}`
      })
    },
    async loadProducts(categoryId) {
      try {
        if(categoryId) {
          // 获取分类下的商品
          const res = await getCategoryWithProducts(categoryId)
          if(res.status === 1) {
            this.products = res.data.products || []
          }
        } else {
          // 获取所有商品
          const res = await getProductList({
            pageNum: this.pageNum,
            pageSize: this.pageSize
          })
          if(res.status === 1) {
            this.products = res.data
          }
        }
      } catch(e) {
        uni.showToast({
          title: e.message || '加载失败',
          icon: 'none'
        })
      }
    }
  },
  onReachBottom() {
    if(this.loadMoreStatus === 'more') {
      this.pageNum++
      this.loadData('loadMore')
    }
  }
}
</script> 