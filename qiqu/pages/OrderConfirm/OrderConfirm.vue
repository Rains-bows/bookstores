<template>
  <div class="order-confirm-page">
    <!-- 自定义导航栏 -->
    <CustomNavBar title="订单确认" />

    <!-- 订单商品列表 -->
    <el-card class="order-list">
      <div v-for="item in orderInfo.items" :key="item.productId" class="order-item">
        <img :src="item.image" class="product-image" />
        <div class="product-info">
          <div class="product-name">{{ item.name }}</div>
          <div class="product-price">¥{{ item.price.toFixed(2) }}</div>
          <div class="product-quantity">数量：{{ item.quantity }}</div>
        </div>
      </div>
    </el-card>

    <!-- 订单总价 -->
    <div class="total-price">
      合计：<span>¥{{ orderInfo.totalAmount.toFixed(2) }}</span>
    </div>

    <!-- 订单详情 -->
    <el-card class="order-details" v-if="orderDetails.length > 0">
      <div v-for="detail in orderDetails" :key="detail.id" class="detail-item">
        <div class="detail-info">
          <div>订单ID：{{ detail.orderId }}</div>
          <div>商品ID：{{ detail.productId }}</div>
          <div>数量：{{ detail.quantity }}</div>
          <div>单价：¥{{ detail.price.toFixed(2) }}</div>
          <div>地址ID：{{ detail.userAddressId }}</div>
        </div>
      </div>
    </el-card>

    <!-- 支付按钮 -->
    <div class="payment-bar">
      <el-button type="danger" class="pay-button" @click="handlePayment">
        立即支付
      </el-button>
    </div>
  </div>
</template>
<script>
import { ElMessage } from 'element-plus';
import CustomNavBar from '@/components/CustomNavBar.vue';
import { getUserInfo } from '@/api/user'; // 引入获取用户信息的接口
import { getAddressesByUserId } from '@/api/address'; // 引入获取地址列表的接口
import { createOrder } from '@/api/order'; // 引入创建订单的接口
import { createOrderDetail } from '@/api/orderDetail'; // 引入创建订单细节的接口

export default {
  components: {
    CustomNavBar,
  },
  data() {
    return {
      orderInfo: {
        totalAmount: 0, // 总金额
        items: [], // 商品列表
      },
      userId: null, // 用户ID
      addressList: [], // 用户地址列表
      orderDetails: [], // 订单详情列表
    };
  },
  async created() {
    // 从路由参数中获取订单信息
    const orderInfo = this.$route.query.orderInfo;
    if (orderInfo) {
      this.orderInfo = JSON.parse(orderInfo);
    } else {
      ElMessage.error('订单信息获取失败');
      uni.navigateTo({ url: '/pages/cart/cart' }); // 如果订单信息为空，跳回购物车页面
    }

    // 获取用户信息
    await this.fetchUserInfo();

    // 获取用户地址列表
    if (this.userId) {
      await this.fetchUserAddress();
    }
  },
  methods: {
    // 生成唯一订单号
    generateOrderId() {
      const timestamp = Date.now(); // 获取当前时间戳
      const random = Math.floor(Math.random() * 10000); // 生成一个 0-9999 的随机数
      return `${timestamp}${random}`; // 拼接时间戳和随机数
    },

    // 获取用户信息
    async fetchUserInfo() {
      try {
        const username = uni.getStorageSync('username'); // 从本地存储中获取用户名
        if (!username) {
          ElMessage.error('用户未登录');
          uni.navigateTo({ url: '/pages/login/login' }); // 如果用户未登录，跳转到登录页面
          return;
        }
        const response = await getUserInfo(username);
        if (response.status === 1) {
          this.userId = response.data.id; // 设置用户ID
        } else {
          ElMessage.error('获取用户信息失败');
        }
      } catch (error) {
        ElMessage.error('获取用户信息失败');
      }
    },

    // 获取用户地址列表
    async fetchUserAddress() {
      try {
        const response = await getAddressesByUserId(this.userId);
        if (response.status === 1) {
          this.addressList = response.data;
          if (this.addressList.length === 0) {
            ElMessage.warning('请先添加收货地址');
            uni.navigateTo({ url: '/pages/address/address' }); // 如果地址为空，跳转到地址管理页面
          }
        } else {
          ElMessage.error('获取地址列表失败');
        }
      } catch (error) {
        ElMessage.error('获取地址列表失败');
      }
    },

    // 处理支付
    async handlePayment() {
      try {
        // 检查地址是否为空
        if (this.addressList.length === 0) {
          ElMessage.warning('请先添加收货地址');
          uni.navigateTo({ url: '/pages/address/address' }); // 如果地址为空，跳转到地址管理页面
          return;
        }

        // 生成唯一订单号
        const orderId = this.generateOrderId();

        // 构造订单数据
        const orderData = {
          id: orderId, // 使用生成的订单号
          userId: this.userId, // 用户ID
          totalAmount: this.orderInfo.totalAmount, // 总金额
          status: '待支付', // 订单状态
        };

        // 创建订单
        const response = await createOrder(orderData);
        if (response.status === 1) {
          ElMessage.success('订单创建成功');
          console.log(response.data);

          // 遍历订单商品列表，创建订单详情
          const orderDetails = [];
          for (const item of this.orderInfo.items) {
            const orderDetailData = {
              orderId: orderId, // 使用生成的订单号
              productId: item.productId, // 产品ID
              quantity: item.quantity, // 数量
              price: item.price, // 单价
              userAddressId: this.addressList[0].id, // 用户地址ID（假设使用第一个地址）
            };

            // 创建订单详情
            const detailResponse = await createOrderDetail(orderDetailData);
            if (detailResponse.status === 1) {
              orderDetails.push(detailResponse.data); // 将订单详情添加到列表中
            } else {
              throw new Error('创建订单详情失败');
            }
          }

          // 将订单详情数据存储在组件的 data 中
          this.orderDetails = orderDetails;

          // 这里可以调用支付接口，完成支付逻辑
          // 支付成功后跳转到订单完成页面
          uni.navigateTo({ url: '/pages/order/complete' });
        } else {
          ElMessage.error(response.message || '订单创建失败');
        }
      } catch (error) {
        ElMessage.error(error.message || '网络错误，请重试');
      }
    },
  },
};
</script>
<style scoped>
.order-confirm-page {
  padding-top: 60px; /* 导航栏高度 */
  background-color: #f5f5f5;
  min-height: 100vh;
}

.order-list {
  margin-bottom: 20px;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.order-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 100px;
  height: 100px;
  margin-right: 20px;
  border-radius: 8px;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.product-price {
  font-size: 14px;
  color: #e64340;
  margin-bottom: 10px;
}

.product-quantity {
  font-size: 14px;
  color: #666;
}

.total-price {
  position: fixed;
  bottom: 60px;
  left: 0;
  right: 0;
  padding: 10px 20px;
  background-color: #fff;
  font-size: 16px;
  font-weight: bold;
  text-align: right;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.total-price span {
  color: #e64340;
}

.payment-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 20px;
  background-color: #fff;
  text-align: right;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.pay-button {
  width: 120px;
}

.order-details {
  margin-bottom: 20px;
}

.detail-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-info div {
  margin-bottom: 5px;
}
</style>