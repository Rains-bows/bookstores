<template>
  <view class="container">
    <!-- 添加分类按钮 -->
    <button class="add-btn" @tap="showAddModal">添加分类</button>
    
    <!-- 分类列表 -->
    <view class="category-list">
      <view v-for="item in categories" :key="item.id" class="category-item">
        <view class="category-info">
          <text class="category-name">{{item.name}}</text>
          <text class="category-desc">{{item.description || '暂无描述'}}</text>
        </view>
        <view class="category-actions">
          <button class="btn edit-btn" @tap="handleEdit(item)">编辑</button>
          <button class="btn delete-btn" @tap="handleDelete(item)">删除</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '@/api/category.js'

export default {
  data() {
    return {
      categories: [],
      isEdit: false,
      currentId: null,
      formData: {
        name: '',
        description: ''
      }
    }
  },
  
  onLoad() {
    this.loadCategories()
  },
  
  onShow() {
    this.loadCategories()
  },
  
  methods: {
    async loadCategories() {
      try {
        const res = await getAllCategories()
        if (res.code === 1) {
          this.categories = res.data
        }
      } catch (error) {
        uni.showToast({
          title: '获取分类列表失败',
          icon: 'none'
        })
      }
    },
    
    showAddModal() {
      uni.navigateTo({
        url: '/pages/category/add'
      })
    },
    
    handleEdit(item) {
      uni.navigateTo({
        url: `/pages/category/edit?category=${encodeURIComponent(JSON.stringify(item))}`
      })
    },
    
    async handleDelete(item) {
      uni.showModal({
        title: '提示',
        content: '确定要删除该分类吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const res = await deleteCategory(item.id)
              if (res.code === 1) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                await this.loadCategories()
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
    
    async handleSubmit() {
      if (!this.formData.name.trim()) {
        uni.showToast({
          title: '请输入分类名称',
          icon: 'none'
        })
        return
      }
      
      try {
        let res
        if (this.isEdit) {
          res = await updateCategory(this.currentId, this.formData)
        } else {
          res = await createCategory(this.formData)
        }
        
        if (res.code === 1) {
          uni.showToast({
            title: this.isEdit ? '更新成功' : '添加成功',
            icon: 'success'
          })
          this.loadCategories()
        }
      } catch (error) {
        console.error('操作失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
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

.add-btn {
  margin-bottom: 20rpx;
  background-color: #007AFF;
  color: #fff;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 28rpx;
  border-radius: 8rpx;
}

.category-list {
  .category-item {
    background-color: #fff;
    padding: 20rpx;
    margin-bottom: 20rpx;
    border-radius: 8rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
    
    .category-info {
      flex: 1;
      
      .category-name {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 10rpx;
        display: block;
      }
      
      .category-desc {
        font-size: 24rpx;
        color: #666;
        display: block;
      }
    }
    
    .category-actions {
      display: flex;
      gap: 20rpx;
      
      .btn {
        font-size: 24rpx;
        padding: 10rpx 20rpx;
        border-radius: 30rpx;
        min-width: 120rpx;
        
        &::after {
          border: none;
        }
      }
      
      .edit-btn {
        background-color: #007AFF;
        color: #fff;
      }
      
      .delete-btn {
        background-color: #ff4d4f;
        color: #fff;
      }
    }
  }
}
</style> 