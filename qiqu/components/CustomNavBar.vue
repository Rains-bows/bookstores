<template>
  <view class="custom-nav-bar">
    <!-- 返回按钮 -->
    <view class="back-btn" @click="handleBack">
      <text class="back-text">返回</text>
    </view>
    <!-- 标题 -->
    <text class="title">{{ title }}</text>
  </view>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '再会情趣用品',
    },
  },
  methods: {
    handleBack() {
      const pages = getCurrentPages(); // 获取当前页面栈
      if (pages.length > 1) {
        // 如果有上一个页面，则返回
        uni.navigateBack({
          delta: 1,
          fail: (err) => {
            console.error('返回失败:', err);
          },
        });
      } else {
        // 如果没有上一个页面，则跳转到首页
        console.warn('已经是第一个页面，跳转到首页');
        uni.reLaunch({
          url: '/pages/mall/mall', // 跳转到首页
        });
      }
    },
  },
};
</script>

<style scoped>
.custom-nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 16px;
  background-color: #8A2BE2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-btn {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.back-text {
  font-size: 16px;
  color: #FFFFFF;
  font-weight: 500;
}

.title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  color: #FFFFFF;
  font-weight: bold;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
</style>