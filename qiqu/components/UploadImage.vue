<template>
  <view class="upload-image">
    <!-- 已上传的图片 -->
    <view 
      class="image-item" 
      v-for="(url, index) in imageList" 
      :key="index"
      @click="handlePreview(url)"
    >
      <image :src="url" mode="aspectFill"/>
      <text class="delete-btn" @click.stop="handleDelete(index)">×</text>
    </view>
    
    <!-- 上传按钮 -->
    <view 
      class="upload-btn"
      v-if="imageList.length < maxCount"
      @click="handleUpload"
    >
      <text class="iconfont icon-add"></text>
      <text>上传图片</text>
    </view>
  </view>
</template>

<script>
import { uploadFile } from '@/api/upload'
import { chooseImage, previewImage } from '@/utils/file'

export default {
  props: {
    // 最大上传数量
    maxCount: {
      type: Number,
      default: 1
    },
    // 已有图片列表
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      imageList: this.value
    }
  },
  watch: {
    value: {
      handler(val) {
        this.imageList = val
      },
      deep: true
    }
  },
  methods: {
    async handleUpload() {
      try {
        // 选择图片
        const files = await chooseImage(this.maxCount - this.imageList.length)
        
        // 上传图片
        for(let file of files) {
          uni.showLoading({
            title: '上传中...'
          })
          
          const res = await uploadFile(file)
          this.imageList.push(res.data)
          this.$emit('input', this.imageList)
        }
      } catch(e) {
        console.error('上传失败:', e)
      } finally {
        uni.hideLoading()
      }
    },
    handlePreview(url) {
      previewImage(this.imageList, url)
    },
    handleDelete(index) {
      uni.showModal({
        title: '提示',
        content: '确定要删除这张图片吗？',
        success: (res) => {
          if(res.confirm) {
            this.imageList.splice(index, 1)
            this.$emit('input', this.imageList)
          }
        }
      })
    }
  }
}
</script>

<style lang="scss">
.upload-image {
  display: flex;
  flex-wrap: wrap;
  
  .image-item {
    position: relative;
    width: 200rpx;
    height: 200rpx;
    margin: 0 20rpx 20rpx 0;
    
    image {
      width: 100%;
      height: 100%;
      border-radius: 8rpx;
    }
    
    .delete-btn {
      position: absolute;
      top: -20rpx;
      right: -20rpx;
      width: 40rpx;
      height: 40rpx;
      line-height: 40rpx;
      text-align: center;
      background: rgba(0,0,0,0.5);
      color: #fff;
      border-radius: 50%;
      font-size: 32rpx;
    }
  }
  
  .upload-btn {
    width: 200rpx;
    height: 200rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #f5f5f5;
    border-radius: 8rpx;
    
    .iconfont {
      font-size: 48rpx;
      color: #999;
      margin-bottom: 10rpx;
    }
    
    text {
      font-size: 24rpx;
      color: #999;
    }
  }
}
</style> 