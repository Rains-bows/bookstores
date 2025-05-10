<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>

<script>
import { ElConfigProvider } from 'element-plus';
import { ref } from 'vue';

export default {
  components: {
    ElConfigProvider,
  },
  setup() {
    const zhCn = ref(null);
    return {
      zhCn
    };
  },
  data() {
    return {
      // 用户相关
      user: null, // 当前登录用户信息
      token: '', // 用户登录token
      
      // 购物车相关
      cartCount: 0, // 购物车商品数量
      cartList: [], // 购物车列表
      
      // 订单相关 
      orderList: [], // 订单列表
      currentOrder: null, // 当前订单
      
      // 商品相关
      productList: [], // 商品列表
      currentProduct: null, // 当前商品详情
      
      // 分类相关
      categoryList: [], // 分类列表
      
      // 地址相关
      addressList: [], // 用户地址列表
      currentAddress: null, // 当前选中地址
      
      // 支付相关
      paymentList: [], // 支付记录列表
      
      // 全局loading
      loading: false,
      
      // 全局消息提示
      message: '',
      messageType: 'success' // success/warning/error
     
    };
  },
  onLaunch: function() {
    console.log('App Launch')
    // 设置状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight
    document.documentElement.style.setProperty('--status-bar-height', `${statusBarHeight}px`)
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  }
};
</script>

<style>
/* 全局样式 */
page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica,
    Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei',
    sans-serif;
  min-height: 100%;
  height: 100%;
}

.container {
  padding: 20rpx;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: #f5f5f5;
}

.flex {
  display: flex;
}

.flex-between {
  justify-content: space-between;
}

.flex-center {
  align-items: center;
}

/* 重置样式 */
view, scroll-view {
  box-sizing: border-box;
}

/* 通用样式 */
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
  box-sizing: border-box;
}

.fixed-container {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1;
  background: #f5f5f5;
}

.scroll-container {
  height: 100%;
  position: relative;
  z-index: 2;
  box-sizing: border-box;
}
</style>