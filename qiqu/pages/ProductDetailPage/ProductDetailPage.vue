<template>
  <div class="container">
    <!-- 自定义导航栏 -->
    <CustomNavBar title="商品详情" />

    <!-- 商品图片 -->
    <div class="product-image">
      <img :src="product.images[0]" alt="商品图片" />
    </div>

    <!-- 商品信息 -->
    <el-card class="product-info">
      <div class="product-name">{{ product.name }}</div>
      <div class="product-price">¥{{ product.price.toFixed(2) }}</div>
      <div class="product-description">{{ product.description }}</div>
    </el-card>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="warning" class="add-to-cart" @click="addToCart">加入购物车</el-button>
      <el-button type="danger" class="buy-now" @click="buyNow">立即购买</el-button>
    </div>
  </div>
</template>
<style scoped>
/* 页面容器 */
.container {
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5; /* 背景色 */
  min-height: 100vh; /* 确保容器至少占满整个视口高度 */
  padding: 20px;
}

/* 商品图片 */
.product-image {
  width: 100%;
  height: 400px; /* 固定高度 */
  margin-bottom: 20px;
  overflow: hidden; /* 防止图片溢出 */
  border-radius: 8px; /* 圆角 */
  background-color: #fff; /* 背景色 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 图片按比例缩放，覆盖整个容器 */
}

/* 商品信息 */
.product-info {
  margin-bottom: 20px;
}

.product-name {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.product-price {
  font-size: 20px;
  color: #e64340; /* 红色价格 */
  margin-bottom: 10px;
}

.product-description {
  font-size: 16px;
  color: #666;
}

/* 操作按钮 */
.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.add-to-cart,
.buy-now {
  flex: 1;
  margin: 0 10px;
}

.add-to-cart {
  background-color: #ff9500; /* 橙色 */
  border-color: #ff9500;
}

.buy-now {
  background-color: #e64340; /* 红色 */
  border-color: #e64340;
}
</style>
<script>
import CustomNavBar from '@/components/CustomNavBar.vue'; // 引入自定义导航栏
import { getProductById } from '@/api/product'; // 引入获取商品详情的方法
import { createCart } from '@/api/cart'; // 引入创建购物车的方法
import { getUserInfo } from '@/api/user'; // 引入获取用户信息的方法
import { ElNotification } from 'element-plus'; // 引入 Element Plus 的通知组件

export default {
  components: {
    CustomNavBar, // 注册自定义导航栏组件
  },
  data() {
    return {
      product: {
        id: '', // 商品ID
        name: '', // 商品名称
        price: 0, // 商品价格
        description: '', // 商品描述
        images: [], // 商品图片列表
      },
    };
  },
  onLoad(options) {
    console.log('路由参数:', options); // 打印路由参数
    const productId = options.id;
    if (productId) {
      this.fetchProductDetail(productId); // 获取商品详情
    } else {
      ElNotification({
        title: '错误',
        message: '商品ID缺失',
        type: 'error',
      });
      uni.navigateBack(); // 返回上一页
    }
  },
  methods: {
    // 获取商品详情
    async fetchProductDetail(productId) {
      try {
        const res = await getProductById(productId);
        if (res.status === 1) {
          this.product = res.data; // 设置商品详情
          // 如果图片为空，设置默认图片
          if (!this.product.images || this.product.images.length === 0) {
            this.product.images = ['https://via.placeholder.com/400x400']; // 默认图片
          }
        } else {
          ElNotification({
            title: '错误',
            message: '获取商品详情失败',
            type: 'error',
          });
        }
      } catch (error) {
        ElNotification({
          title: '错误',
          message: '网络错误，请稍后重试',
          type: 'error',
        });
      }
    },
    // 加入购物车
    async addToCart() {
      try {
        // 获取当前登录用户的 username（假设从本地存储中获取）
        const username = localStorage.getItem('username');
        if (!username) {
          ElNotification({
            title: '错误',
            message: '用户未登录，请先登录',
            type: 'error',
          });
          return;
        }

        // 调用获取用户信息接口
        const userRes = await getUserInfo(username);
        if (userRes.status !== 1) {
          ElNotification({
            title: '错误',
            message: '获取用户信息失败',
            type: 'error',
          });
          return;
        }

        const userId = userRes.data.id; // 用户ID
        const productId = this.product.id; // 商品ID
        const quantity = 1; // 默认数量为 1

        // 封装购物车数据
        const cartItem = {
          userId,
          productId,
          quantity,
        };

        // 调用创建购物车接口
        const cartRes = await createCart(cartItem);
        if (cartRes.status === 1) {
          ElNotification({
            title: '成功',
            message: '已加入购物车',
            type: 'success',
          });
        } else {
          ElNotification({
            title: '错误',
            message: '加入购物车失败',
            type: 'error',
          });
        }
      } catch (error) {
        ElNotification({
          title: '错误',
          message: '网络错误，请稍后重试',
          type: 'error',
        });
      }
    },
    // 立即购买
    buyNow() {
      ElNotification({
        title: '提示',
        message: '立即购买',
        type: 'info',
      });
      // 这里可以跳转到订单确认页，或者直接调用购买 API
    },
  },
};
</script>