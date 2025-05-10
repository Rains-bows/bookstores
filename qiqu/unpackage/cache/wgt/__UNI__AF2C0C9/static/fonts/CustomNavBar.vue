<template>
  <!-- 导航栏 -->
  <view class="custom-nav-bar">
    <!-- 返回按钮 -->
    <view class="back-btn" @click="handleBack">
      <text class="back-icon">&#xe6a4;</text> <!-- 使用图标字体 -->
      <text class="back-text">返回</text>
    </view>
    <!-- 标题 -->
    <text class="title">{{ title }}</text>
  </view>

  <!-- 页面内容 -->
  <view class="page-content">
    <!-- 你的页面内容 -->
    <slot></slot>
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
      uni.navigateBack();
    },
  },
};
</script>

<style scoped>
/* 导航栏样式 */
.custom-nav-bar {
  position: fixed; /* 固定在顶部 */
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000; /* 确保导航栏在最上层 */
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 16px;
  background-color: #8A2BE2; /* 深紫色背景 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 添加阴影 */
}

/* 返回按钮样式 */
.back-btn {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.back-icon {
  font-family: 'iconfont'; /* 使用图标字体 */
  font-size: 20px;
  color: #FFFFFF; /* 白色图标 */
  margin-right: 8px;
}

.back-text {
  font-size: 16px;
  color: #FFFFFF; /* 白色文字 */
  font-weight: 500; /* 中等字体粗细 */
}

/* 标题样式 */
.title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  color: #FFFFFF; /* 白色标题 */
  font-weight: bold; /* 加粗字体 */
  position: absolute; /* 绝对定位 */
  left: 50%; /* 水平居中 */
  transform: translateX(-50%); /* 调整居中 */
}

/* 页面内容样式 */
.page-content {
  padding-top: 60px; /* 与导航栏高度相同，避免内容被遮挡 */
  box-sizing: border-box; /* 确保 padding 不影响布局 */
}
</style>