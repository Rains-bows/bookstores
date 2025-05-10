<template>
  <view class="container">
    <!-- 注意事项提示 -->
    <view class="tips-box">
      <view class="tips-title">注意事项：</view>
      <view class="tips-content">
        <text>1. 商品名称和描述请勿包含色情、暴力等违规内容</text>
        <text>2. 建议使用"*"代替敏感词汇</text>
        <text>3. 商品描述应当客观真实，避免虚假宣传</text>
        <text>4. 上传的图片内容需要合规，禁止违规图片</text>
      </view>
    </view>
    <view class="form">
      <!-- 图片上传区域 -->
      <view class="form-item">
        <text class="label">商品图片</text>
        <view class="upload-box">
          <image 
            v-if="formData.image" 
            :src="formData.image" 
            class="preview-image"
            mode="aspectFit"
            @tap="previewImage"
          ></image>
          <view 
            v-else 
            class="upload-btn"
            @tap="chooseImage"
          >
            <text class="iconfont icon-add"></text>
            <text class="upload-text">上传图片</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="label">商品名称</text>
        <input 
          type="text"
          v-model="formData.name"
          placeholder="请输入商品名称"
          class="input"
        />
      </view>
      
      <view class="form-item">
        <text class="label">商品价格</text>
        <input 
          type="digit"
          v-model="formData.price"
          placeholder="请输入商品价格"
          class="input"
        />
      </view>
      
      <view class="form-item">
        <text class="label">商品库存</text>
        <input 
          type="number"
          v-model="formData.stock"
          placeholder="请输入商品库存"
          class="input"
        />
      </view>
      
      <view class="form-item">
        <text class="label">商品描述</text>
        <textarea
          v-model="formData.description"
          placeholder="请输入商品描述"
          class="textarea"
        />
      </view>
      
      <view class="form-item">
        <text class="label">商品状态</text>
        <switch 
          :checked="formData.isActive" 
          @change="handleStatusChange"
          color="#007AFF"
        />
      </view>
      
      <!-- 分类选择 -->
      <view class="form-item">
        <text class="label">商品分类</text>
        <picker 
          @change="handleCategoryChange" 
          :value="categoryIndex" 
          :range="categories" 
          range-key="name"
        >
          <view class="picker">
            {{categories[categoryIndex]?.name || '请选择分类'}}
          </view>
        </picker>
      </view>
      
      <button @tap="handleSubmit" class="submit-btn">{{ isEdit ? '保存' : '添加' }}</button>
    </view>
  </view>
</template>

<script>
import { createProduct, updateProduct, getProductById } from '@/api/product.js'
import { uploadImage } from '@/api/upload.js'
import { getAllCategories } from '@/api/category.js'

export default {
  data() {
    return {
      isEdit: false,
      productId: null,
      categories: [],
      categoryIndex: 0,
      formData: {
        name: '',
        price: '',
        description: '',
        stock: 0,
        isActive: true,
        image: '',
        categoryId: null
      }
    }
  },
  
  async onLoad(options) {
    await this.loadCategories()
    if (this.categories.length > 0) {
      this.categoryIndex = 0
      this.formData.categoryId = this.categories[0].id
    }
    
    if (options.id) {
      this.isEdit = true
      this.productId = parseInt(options.id)
      this.loadProductDetail()
    }
  },
  
  methods: {
    async loadCategories() {
      try {
        const res = await getAllCategories()
        if (res.code === 1) {
          this.categories = res.data
          if (!this.isEdit && this.categories.length > 0) {
            this.categoryIndex = 0
            this.formData.categoryId = this.categories[0].id
          }
          if (this.formData.categoryId) {
            this.categoryIndex = this.categories.findIndex(item => item.id === this.formData.categoryId)
          }
        }
      } catch (error) {
        uni.showToast({
          title: '获取分类列表失败',
          icon: 'none'
        })
      }
    },
    
    handleCategoryChange(e) {
      this.categoryIndex = e.detail.value
      this.formData.categoryId = this.categories[this.categoryIndex].id
      console.log('选择的分类ID:', this.formData.categoryId)
    },
    
    async loadProductDetail() {
      try {
        const res = await getProductById(this.productId)
        if (res.code === 1 && res.data) {
          const { name, price, description, stock, isActive, categoryId } = res.data
          this.formData = {
            name,
            price: price.toString(),
            description,
            stock,
            isActive,
            categoryId
          }
          
          if (categoryId) {
            this.categoryIndex = this.categories.findIndex(item => item.id === categoryId)
          }
        } else {
          uni.showToast({
            title: '获取商品信息失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.showToast({
          title: '获取商品信息失败',
          icon: 'none'
        })
      }
    },
    
    handleStatusChange(e) {
      this.formData.isActive = e.detail.value
    },
    
    validateForm() {
      if (!this.formData.name.trim()) {
        uni.showToast({
          title: '请输入商品名称',
          icon: 'none'
        })
        return false
      }
      
      if (!this.formData.price || isNaN(this.formData.price)) {
        uni.showToast({
          title: '请输入正确的价格',
          icon: 'none'
        })
        return false
      }
      
      if (!this.formData.stock || isNaN(this.formData.stock)) {
        uni.showToast({
          title: '请输入正确的库存数量',
          icon: 'none'
        })
        return false
      }
      
      if (!this.formData.categoryId) {
        uni.showToast({
          title: '请选择商品分类',
          icon: 'none'
        })
        return false
      }
      
      return true
    },
    
    async handleSubmit() {
      if (!this.validateForm()) return
      
      try {
        const submitData = {
          ...this.formData,
          price: parseFloat(this.formData.price),
          stock: parseInt(this.formData.stock),
          categoryId: this.formData.categoryId
        }
        
        if (this.isEdit) {
          submitData.id = this.productId
        }
        
        const api = this.isEdit ? updateProduct : createProduct
        const res = await api(submitData)
        
        if (res.code === 1) {
          uni.showToast({
            title: this.isEdit ? '更新成功' : '添加成功',
            icon: 'success'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: res.message || '操作失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },

    // 选择图片
    async chooseImage() {
      try {
        const res = await uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera']
        })
        
        if (res.tempFiles.length > 0) {
          uni.showLoading({
            title: '上传中...'
          })
          
          try {
            // 添加文件名信息
            const file = {
              path: res.tempFiles[0].path,
              name: res.tempFiles[0].name || `image_${Date.now()}.jpg`
            }
            const uploadRes = await uploadImage(file)
            if (uploadRes.code === 1) {
              this.formData.image = uploadRes.data
              uni.showToast({
                title: '上传成功',
                icon: 'success'
              })
            } else {
              uni.showToast({
                title: '上传失败',
                icon: 'none'
              })
            }
          } catch (error) {
            console.error('上传失败:', error)
            uni.showToast({
              title: '上传失败',
              icon: 'none'
            })
          } finally {
            uni.hideLoading()
          }
        }
      } catch (error) {
        console.error('选择图片失败:', error)
      }
    },
    
    // 预览图片
    previewImage() {
      if (this.formData.image) {
        uni.previewImage({
          urls: [this.formData.image]
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
}

.form {
  background-color: #fff;
  padding: 20rpx;
  border-radius: 8rpx;
  
  .form-item {
    margin-bottom: 30rpx;
    
    .label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 10rpx;
    }
    
    .input {
      width: 100%;
      height: 80rpx;
      border: 1px solid #ddd;
      border-radius: 8rpx;
      padding: 0 20rpx;
      box-sizing: border-box;
    }
    
    .textarea {
      width: 100%;
      height: 200rpx;
      border: 1px solid #ddd;
      border-radius: 8rpx;
      padding: 20rpx;
      box-sizing: border-box;
    }
  }
  
  .submit-btn {
    width: 100%;
    height: 80rpx;
    line-height: 80rpx;
    background-color: #007AFF;
    color: #fff;
    border-radius: 8rpx;
    margin-top: 40rpx;
  }
}

.upload-box {
  margin-top: 10rpx;
  
  .preview-image {
    width: 200rpx;
    height: 200rpx;
    border-radius: 8rpx;
  }
  
  .upload-btn {
    width: 200rpx;
    height: 200rpx;
    border: 2rpx dashed #ddd;
    border-radius: 8rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    .icon-add {
      font-size: 60rpx;
      color: #999;
      margin-bottom: 10rpx;
    }
    
    .upload-text {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.picker {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
}

.tips-box {
  background-color: #fff7e6;
  padding: 20rpx;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
  
  .tips-title {
    font-size: 28rpx;
    color: #f59a23;
    margin-bottom: 10rpx;
    font-weight: bold;
  }
  
  .tips-content {
    text {
      font-size: 24rpx;
      color: #666;
      display: block;
      line-height: 1.6;
    }
  }
}
</style> 