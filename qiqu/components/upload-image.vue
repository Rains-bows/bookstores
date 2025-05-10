<template>
  <view class="upload-image">
    <view class="image-list">
      <view class="image-item" 
            v-for="(item, index) in imageList" 
            :key="index">
        <image :src="item" mode="aspectFill"></image>
        <text class="delete" @click="deleteImage(index)">×</text>
      </view>
      
      <view class="upload-btn" 
            v-if="imageList.length < maxCount"
            @click="chooseImage">
        <text class="iconfont icon-add"></text>
        <text>上传图片</text>
      </view>
    </view>
  </view>
</template>

<script>
import { uploadFile } from '@/api/upload'

export default {
  props: {
    value: {
      type: Array,
      default: () => []
    },
    maxCount: {
      type: Number,
      default: 1
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
    chooseImage() {
      uni.chooseImage({
        count: this.maxCount - this.imageList.length,
        success: async (res) => {
          const tempFiles = res.tempFilePaths
          
          for(let file of tempFiles) {
            try {
              const uploadRes = await uploadFile(file)
              this.imageList.push(uploadRes.data)
              this.$emit('input', this.imageList)
            } catch(e) {
              // 错误处理已在上传方法中处理
            }
          }
        }
      })
    },
    deleteImage(index) {
      this.imageList.splice(index, 1)
      this.$emit('input', this.imageList)
    }
  }
}
</script>

<style lang="scss">
.upload-image {
  .image-list {
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
      
      .delete {
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
      border: 2rpx dashed #ddd;
      border-radius: 8rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      
      .iconfont {
        font-size: 48rpx;
        color: #999;
        margin-bottom: 10rpx;
      }
      
      text {
        font-size: 26rpx;
        color: #999;
      }
    }
  }
}
</style> 