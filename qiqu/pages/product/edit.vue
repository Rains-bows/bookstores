<template>
  <view class="container">
    <product-form
      ref="productForm"
      :product="product"
      :categories="categories"
    />
    <button class="submit-btn" @click="handleSubmit">保存</button>
  </view>
</template>

<script>
import ProductForm from '@/components/ProductForm.vue'
import { createProduct, updateProduct, getProductDetail } from '@/api/product'
import { getCategoryList } from '@/api/category'

export default {
  components: {
    ProductForm
  },
  data() {
    return {
      product: {},
      categories: [],
      id: null
    }
  },
  onLoad(options) {
    if(options.id) {
      this.id = options.id
      this.getDetail()
    }
    this.getCategories()
  },
  methods: {
    async getDetail() {
      try {
        const res = await getProductDetail(this.id)
        if(res.status === 1) {
          this.product = res.data
        }
      } catch(e) {
        console.error('获取商品详情失败:', e)
      }
    },
    async getCategories() {
      try {
        const res = await getCategoryList()
        if(res.status === 1) {
          this.categories = res.data
        }
      } catch(e) {
        console.error('获取分类列表失败:', e)
      }
    },
    async handleSubmit() {
      const form = this.$refs.productForm
      if(!form.validate()) return
      
      const data = form.getFormData()
      try {
        const api = this.id ? updateProduct : createProduct
        const res = await api(this.id, data)
        if(res.status === 1) {
          uni.showToast({
            title: this.id ? '修改成功' : '添加成功',
            icon: 'success'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        }
      } catch(e) {
        console.error('保存商品失败:', e)
      }
    }
  }
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: #fff;
}

.submit-btn {
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
}
</style> 