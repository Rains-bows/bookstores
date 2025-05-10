<template>
  <view class="guide-container">
    <!-- 动态流光背景 -->
    <view class="gradient-bg"></view>
    
    <!-- 引导提示 -->
    <view class="corner-guide">
      <view class="guide-icon">⬆</view>
      <text class="guide-text">点击右上角<br>选择浏览器打开</text>
    </view>

    <!-- 内容容器 -->
    <view class="content-wrapper">
      <!-- 情感化头部 -->
      <view class="emotion-header">
        <view class="heartbeat-icon">💖</view>
        <text class="emotion-title">感谢您的热情支持！</text>
        <text class="emotion-subtitle">您的喜爱让我们既惊喜又惶恐</text>
      </view>

      <!-- 业务公告 -->
      <view class="notice-card">
        <view class="notice-icon">📢</view>
        <text class="notice-title">访问受限说明</text>
        <text class="notice-content">
          因近期销量很好订单量暴增，微信的访问通道被拦截啦
          \n只能请您通过浏览器继续访问，享受完整服务
          \n给您带来的不便我们深表歉意
        </text>
      </view>

      <!-- 步骤引导 -->
      <view class="step-cards">
        <view class="step-card">
          <view class="step-index">01</view>
          <text class="step-title">打开系统菜单</text>
          <text class="step-desc">点击右上角「···」菜单按钮</text>
        </view>
        <view class="step-arrow">→</view>
        <view class="step-card">
          <view class="step-index">02</view>
          <text class="step-title">选择浏览器</text>
          <text class="step-desc">在弹出菜单中选择「在浏览器打开」</text>
        </view>
      </view>

      <!-- 域名展示 -->
      <view class="domain-card" @tap="handleAutoCopy">
        <view class="domain-meta">
          <text class="domain-label">点击自动复制安全访问通道 请您浏览器粘贴使用</text>
          <text class="domain-value">https://www.zaihui.xyz</text>
        </view>
        <view class="copy-status" :style="{ opacity: copyStatus }">
          {{ copyMessage }}
        </view>
      </view>

      <!-- 安全认证 -->
      <view class="security-badge">
        <view class="ssl-icon">🔒</view>
        <text class="security-text">SSL安全加密 · ICP认证企业</text>
      </view>
    </view>
  </view>
</template>



<script setup>
import { ref, onMounted } from 'vue'

const targetUrl = 'https://www.zaihui.xyz'
const copyStatus = ref(0)
const copyMessage = ref('')

// 安全跳转方法（新增验证参数）
const safeRedirect = () => {
  const params = new URLSearchParams({
    from: 'external',
    t: Date.now()
  })
  const finalUrl = `${targetUrl}?${params}`
  
  try {
    const blank = window.open('about:blank')
    blank.location.href = finalUrl
  } finally {
    window.location.href = finalUrl
  }
}

// 复制处理（优化跳转逻辑）
const handleAutoCopy = async () => {
  try {
    await navigator.clipboard.writeText(targetUrl)
    copyMessage.value = '✓ 已复制到剪贴板'
    copyStatus.value = 1
    setTimeout(() => copyStatus.value = 0, 1500)
    setTimeout(safeRedirect, 1000)
  } catch {
    uni.showModal({
      title: '请手动复制',
      content: targetUrl,
      success: safeRedirect
    })
  }
}

// 生命周期管理（简化检测逻辑）
onMounted(() => {
  // 非微信环境直接跳转
  if (!/micromessenger/i.test(navigator.userAgent)) {
    safeRedirect()
  }
})
</script>



<style>
/* 基础样式 */
.guide-container {
  height: 100vh;
  background: linear-gradient(135deg, #0F1A2F, #1A365D);
  position: relative;
  overflow: hidden;
   overflow: hidden;
    transition: opacity 0.3s;
}

.gradient-bg {
  position: absolute;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    rgba(26,92,255,0.1) 0%,
    rgba(92,26,255,0.1) 100%
  );
    animation: bgFlow 25s linear infinite;
    will-change: transform;
}

@keyframes bgFlow {
  0% { transform: translate(0,0); }
  100% { transform: translate(-50%,-50%); }
}

/* 情感化头部 */
.emotion-header {
  text-align: center;
  margin: 60rpx 0 40rpx;
  padding: 0 40rpx;
}

.heartbeat-icon {
  font-size: 88rpx;
  animation: heartbeat 1.5s ease-in-out infinite;
}

.emotion-title {
  font-size: 44rpx;
  color: #FF6B6B;
  font-weight: 600;
  display: block;
  margin: 20rpx 0;
  text-shadow: 0 4rpx 12rpx rgba(255,107,107,0.3);
}

.emotion-subtitle {
  font-size: 32rpx;
  color: #A6B5CC;
  display: block;
}

@keyframes heartbeat {
  0%,100% { transform: scale(1); }
  15% { transform: scale(1.2); }
  30% { transform: scale(0.95); }
  45% { transform: scale(1.1); }
  60% { transform: scale(0.98); }
  75% { transform: scale(1.05); }
}

/* 业务公告 */
.notice-card {
  background: rgba(255,255,255,0.95);
  border-radius: 24rpx;
  margin: 40rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.1);
}

.notice-icon {
  font-size: 56rpx;
  color: #1A5CFF;
  margin-bottom: 20rpx;
}

.notice-title {
  font-size: 36rpx;
  color: #333;
  font-weight: 600;
  display: block;
  margin-bottom: 20rpx;
}

.notice-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
  white-space: pre-wrap;
}

/* 步骤引导卡片 */
.step-cards {
  display: flex;
  justify-content: center;
  gap: 40rpx;
  padding: 0 40rpx;
  margin: 40rpx 0;
}

.step-card {
  background: rgba(255,255,255,0.95);
  border-radius: 24rpx;
  padding: 40rpx;
  width: 320rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.step-card:active {
  transform: scale(0.98);
}

.step-index {
  font-size: 48rpx;
  color: #1A5CFF;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.step-title {
  font-size: 36rpx;
  color: #0F1A2F;
  font-weight: 500;
  display: block;
  margin-bottom: 12rpx;
}

.step-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
}

.step-arrow {
  color: #fff;
  font-size: 56rpx;
  align-self: center;
  opacity: 0.5;
}

/* 智能域名展示 */
.domain-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  margin: 60rpx 40rpx;
  padding: 40rpx;
  position: relative;
  overflow: visible;
  transition: transform 0.3s;
  animation: pulse 3s ease-in-out infinite;
}

.domain-card:active {
  transform: scale(0.98);
}

.domain-meta {
  position: relative;
  z-index: 2;
}

.domain-label {
  font-size: 28rpx;
  color: #666;
  display: block;
}

.domain-value {
  font-size: 48rpx;
  color: #1A5CFF;
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
  margin-top: 20rpx;
  display: block;
}

.copy-status {
  position: absolute;
  bottom: -50rpx;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(26,92,255,0.9);
  color: white;
  padding: 16rpx 32rpx;
  border-radius: 48rpx;
  font-size: 28rpx;
  min-width: 280rpx;
  text-align: center;
  opacity: 0;
  transition: all 0.3s;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.02); opacity: 1; }
  100% { transform: scale(1); opacity: 0.9; }
}

/* 安全认证 */
.security-badge {
  text-align: center;
  margin: 60rpx 0;
  opacity: 0.8;
}

.ssl-icon {
  font-size: 48rpx;
  margin-bottom: 12rpx;
}

.security-text {
  font-size: 24rpx;
  color: #A6B5CC;
  letter-spacing: 1rpx;
}

/* 专业引导提示 */
.corner-guide {
  position: fixed;
  top: 20rpx;
  right: 30rpx;
  z-index: 999;
  text-align: right;
  animation: guideFloat 2s ease-in-out infinite;
}

.guide-icon {
  font-size: 48rpx;
  color: #fff;
  text-shadow: 0 4rpx 12rpx rgba(26,92,255,0.5);
}

.guide-text {
  font-size: 28rpx;
  color: #A6B5CC;
  line-height: 1.4;
  margin-top: 10rpx;
  display: inline-block;
  background: rgba(255,255,255,0.1);
  padding: 12rpx 24rpx;
  border-radius: 48rpx;
}

@keyframes guideFloat {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}
</style>