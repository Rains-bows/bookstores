<template>
  <view class="product-form">
    <view class="form-item">
      <text class="label">商品名称</text>
      <input 
        type="text"
        v-model="form.name"
        placeholder="请输入商品名称"
      />
    </view>
    
    <view class="form-item">
      <text class="label">商品价格</text>
      <input 
        type="digit"
        v-model="form.price"
        placeholder="请输入商品价格"
      />
    </view>
    
    <view class="form-item">
      <text class="label">商品库存</text>
      <input 
        type="number"
        v-model="form.stock"
        placeholder="请输入商品库存"
      />
    </view>
    
    <view class="form-item">
      <text class="label">商品分类</text>
      <picker 
        :range="categories" 
        range-key="name"
        @change="handleCategoryChange"
      >
        <view class="picker">
          {{ form.categoryId ? getCategoryName(form.categoryId) : '请选择商品分类' }}
        </view>
      </picker>
    </view>
    
    <view class="form-item">
      <text class="label">商品图片</text>
      <upload-image 
        v-model="imageList"
        :max-count="1"
        @input="handleImageChange"
      />
    </view>
    
    <view class="form-item">
      <text class="label">商品描述</text>
      <textarea
        v-model="form.description"
        placeholder="请输入商品描述"
      />
    </view>
    
    <view class="form-item">
      <text class="label">是否上架</text>
      <switch 
        :checked="form.isActive"
        @change="handleStatusChange"
      />
    </view>
  </view>
</template>

<script>
import UploadImage from './UploadImage.vue'

export default {
  components: {
    UploadImage
  },
  props: {
    // 编辑时的商品数据
    product: {
      type: Object,
      default: () => ({})
    },
    // 商品分类列表
    categories: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      form: {
        name: '',
        price: '',
        stock: '',
        categoryId: null,
        image: '',
        description: '',
        isActive: true
      },
      imageList: []
    }
  },
  watch: {
    product: {
      handler(val) {
        if(val.id) {
          this.form = { ...val }
          this.imageList = val.image ? [val.image] : []
        }
      },
      immediate: true
    }
  },
  methods: {
    handleCategoryChange(e) {
      const index = e.detail.value
      this.form.categoryId = this.categories[index].id
    },
    handleImageChange(urls) {
      this.form.image = urls[0] || ''
    },
    handleStatusChange(e) {
      this.form.isActive = e.detail.value
    },
    getCategoryName(id) {
      const category = this.categories.find(item => item.id === id)
      return category ? category.name : ''
    },
    // 获取表单数据
    getFormData() {
      return this.form
    },
    // 验证表单
    validate() {
      if(!this.form.name) {
        uni.showToast({
          title: '请输入商品名称',
          icon: 'none'
        })
        return false
      }
      if(!this.form.price) {
        uni.showToast({
          title: '请输入商品价格',
          icon: 'none'
        })
        return false
      }
      if(!this.form.stock) {
        uni.showToast({
          title: '请输入商品库存',
          icon: 'none'
        })
        return false
      }
      if(!this.form.categoryId) {
        uni.showToast({
          title: '请选择商品分类',
          icon: 'none'
        })
        return false
      }
      return true
    }
  }
}
</script>

<style lang="scss">
.product-form {
  padding: 30rpx;
  
  .form-item {
    margin-bottom: 30rpx;
    
    .label {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 20rpx;
      display: block;
    }
    
    input, textarea, .picker {
      width: 100%;
      height: 80rpx;
      background: #f5f5f5;
      border-radius: 8rpx;
      padding: 0 20rpx;
      font-size: 28rpx;
      color: #333;
    }
    
    textarea {
      height: 200rpx;
      padding: 20rpx;
      line-height: 1.5;
    }
    
    .picker {
      line-height: 80rpx;
    }
  }
}
</style> 