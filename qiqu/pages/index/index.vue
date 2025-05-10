<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input" @click="goSearch">
        <text class="iconfont icon-search"></text>
        <text class="placeholder">搜索商品</text>
      </view>
    </view>

    <!-- 轮播图 -->
    <swiper class="banner" 
            autoplay 
            circular 
            :indicator-dots="true"
            :interval="3000"
            indicator-active-color="#FE8C00">
      <swiper-item v-for="(item, index) in banners" :key="index">
        <image :src="item.image" mode="aspectFill" @click="handleBannerClick(item)"/>
      </swiper-item>
    </swiper>

    <!-- 分类导航 -->
    <view class="nav-list">
      <view class="nav-item" 
            v-for="(item, index) in categories" 
            :key="index"
            @click="goToCategory(item)">
        <image :src="item.icon || '/static/images/category-default.png'" mode="aspectFit"/>
        <text>{{item.name}}</text>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="product-list">
      <view class="product-item" 
            v-for="item in products" 
            :key="item.id"
            @click="goDetail(item)">
        <image :src="item.image" mode="aspectFill"/>
        <view class="info">
          <text class="name">{{item.name}}</text>
          <text class="price">¥{{item.price}}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getProductList } from '@/api/product'
import { getCategoryList } from '@/api/category'

export default {
  data() {
    return {
      banners: [
        { image: '/static/images/banner1.jpg', url: '' },
        { image: '/static/images/banner2.jpg', url: '' },
        { image: '/static/images/banner3.jpg', url: '' }
      ],
      categories: [],
      products: []
    }
  },
  onLoad() {
    this.loadData()
	this.checkBrowser()
  },
  onPullDownRefresh() {
    this.loadData()
  },
  methods: {
	   checkBrowser() {
	        const userAgent = uni.getSystemInfoSync().platform;
	        const browserInfo = navigator.userAgent.toLowerCase();
	  
	        // 微信环境检测
	        if (userAgent === 'ios' || userAgent === 'android') {
	          if (browserInfo.includes('micromessenger')) {
	            this.isWeChat = true;
	          }
	          if (browserInfo.includes('qqbrowser')) {
	            this.isQQBrowser = true;
	          }
	        }
	  
	        // PC端QQ浏览器检测
	        if (userAgent === 'windows' && browserInfo.includes('qq')) {
	          this.isQQBrowser = true;
	        }
	  
	        // 如果是微信/QQ环境且不在标准浏览器中
	        if (this.isWeChat || this.isQQBrowser) {
	          this.showGuideModal();
	        }
	      },
	  
	      // 新增方法：显示引导弹窗
	      showGuideModal() {
	        uni.showModal({
	          title: '提示',
	          content: '当前使用的是微信/QQ内置浏览器，建议切换至标准浏览器以获得更好的体验',
	          confirmText: '立即打开浏览器',
	          success: (res) => {
	            if (res.confirm) {
	              this.openBrowser();
	            }
	          }
	        });
	      },
	  
	      // 新增方法：打开标准浏览器
	      openBrowser() {
	        const currentUrl = window.location.href.replace('mini://', '').replace('wxapp://', '');
	        uni.setClipboardData({
	          data: currentUrl,
	          success() {
	            uni.showToast({
	              title: '复制成功！请打开浏览器粘贴访问',
	              icon: 'success'
	            });
	          }
	        });
	  
	        // 自动跳转（部分场景可能需要用户手动操作）
	        // uni.navigateTo({
	        //   url: currentUrl
	        // })
	      },
    async loadData() {
      try {
		    
        // 获取分类列表
        const categoryRes = await getCategoryList()
        if(categoryRes.status === 1) {
          this.categories = categoryRes.data
        }

        // 获取商品列表(使用分页接口)
        const productRes = await getProductList({
          pageNum: 1,
          pageSize: 10
        })
        if(productRes.status === 1) {
          this.products = productRes.data
        }
      } catch(e) {
        uni.showToast({
          title: e.message || '加载失败',
          icon: 'none'
        })
      } finally {
        uni.stopPullDownRefresh()
      }
    },
    goSearch() {
      uni.navigateTo({
        url: '/pages/search/search'
      })
    },
    handleBannerClick(item) {
      if(item.url) {
        uni.navigateTo({
          url: item.url
        })
      }
    },
    goToCategory(category) {
      uni.navigateTo({
        url: `/pages/product/list?categoryId=${category.id}`
      })
    },
    goDetail(item) {
      uni.navigateTo({
        url: `/pages/product/detail?id=${item.id}`
      })
    }
  }
}
</script>

<style lang="scss">
.container {
  padding-bottom: 20rpx;
}

.search-bar {
  padding: 20rpx 30rpx;
  background: #fff;
  
  .search-input {
    height: 72rpx;
    background: #f5f5f5;
    border-radius: 36rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .iconfont {
      font-size: 32rpx;
      color: #999;
      margin-right: 10rpx;
    }
    
    .placeholder {
      font-size: 28rpx;
      color: #999;
    }
  }
}

.banner {
  width: 100%;
  height: 300rpx;
  
  image {
    width: 100%;
    height: 100%;
  }
}

.nav-list {
  display: flex;
  flex-wrap: wrap;
  padding: 30rpx;
  background: #fff;
  
  .nav-item {
    width: 20%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20rpx;
    
    image {
      width: 80rpx;
      height: 80rpx;
      margin-bottom: 16rpx;
    }
    
    text {
      font-size: 24rpx;
      color: #333;
    }
  }
}

.product-list {
  display: flex;
  flex-wrap: wrap;
  padding: 0 20rpx;
  background: #fff;
  
  .product-item {
    width: 345rpx;
    margin-bottom: 20rpx;
    margin-right: 20rpx;
    
    &:nth-child(2n) {
      margin-right: 0;
    }
    
    image {
      width: 345rpx;
      height: 345rpx;
      border-radius: 12rpx;
    }
    
    .info {
      padding: 16rpx 0;
      
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
        margin-top: 12rpx;
      }
    }
  }
}
</style>