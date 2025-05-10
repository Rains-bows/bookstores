<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <CustomNavBar :title="categoryName" />

    <!-- 商品列表 -->
    <view class="product-list">
      <view
        class="product-item"
        v-for="(product, index) in products"
        :key="index"
        @click="goToProductDetail(product.id)"
      >
        <image :src="product.image" mode="aspectFill" class="product-image" />
        <view class="product-info">
          <text class="product-name">{{ product.name }}</text>
          <text class="product-price">¥{{ product.price.toFixed(2) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import CustomNavBar from '@/components/CustomNavBar.vue'; // 引入自定义导航栏

export default {
  components: {
    CustomNavBar, // 注册自定义导航栏组件
  },
  data() {
    return {
      categoryName: '', // 分类名称
      products: [], // 商品列表
    };
  },
  onLoad(options) {
    // 从路由参数中获取分类数据
    if (options.category) {
      const category = JSON.parse(decodeURIComponent(options.category));
      this.categoryName = category.name; // 设置分类名称
      this.products = category.products || []; // 设置商品列表
    } else {
      uni.showToast({
        title: '分类数据加载失败',
        icon: 'none',
      });
    }
  },
  methods: {
    // 跳转到商品详情页
    goToProductDetail(productId) {
      uni.navigateTo({
        url: `/pages/ProductDetailPage/ProductDetailPage?id=${productId}`,
      });
    },
  },
};
</script>

<style scoped>
/* 页面容器 */
.container {
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5; /* 背景色 */
  min-height: 100vh; /* 确保容器至少占满整个视口高度 */
}

/* 商品列表 */
.product-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 20rpx;
  margin-top: 80rpx; /* 留出导航栏高度 */
}

.product-item {
  width: 48%; /* 每行显示两个商品 */
  background-color: #fff;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 300rpx;
}

.product-info {
  padding: 20rpx;
}

.product-name {
  font-size: 28rpx;
  color: #333;
}

.product-price {
  font-size: 24rpx;
  color: #e64340; /* 红色价格 */
  margin-top: 10rpx;
}

/* 媒体查询：小屏幕适配 */
@media (max-width: 600px) {
  .product-item {
    width: 100%; /* 小屏幕下每行显示一个商品 */
  }

  .product-image {
    height: 200rpx;
  }

  .product-name {
    font-size: 24rpx;
  }

  .product-price {
    font-size: 20rpx;
  }
}
</style>