<template>
  <view class="container">
    <view class="category-info" v-if="category">
      <image class="category-image" :src="category.image" mode="aspectFill" />
      <text class="category-name">{{ category.name }}</text>
      <text class="category-desc">{{ category.description }}</text>
    </view>
    
    <view class="product-list">
      <view class="product-item" v-for="product in products" :key="product.id">
        <image class="product-image" :src="product.image" mode="aspectFill" />
        <view class="product-info">
          <text class="product-name">{{ product.name }}</text>
          <text class="product-price">¥{{ product.price }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      category: null,
      products: []
    }
  },
  async onLoad(options) {
    if (options.id) {
      await this.loadCategoryDetail(options.id)
    }
  },
  methods: {
    async loadCategoryDetail(id) {
      try {
        const res = await getCategoryWithProducts(id)
        if (res.code === 200) {
          this.category = res.data.category
          this.products = res.data.products
        } else {
          uni.showToast({
            title: '获取分类详情失败',
            icon: 'none'
          })
        }
      } catch (e) {
        uni.showToast({
          title: '获取分类详情失败',
          icon: 'none'
        })
      }
    }
  }
}
</script> 