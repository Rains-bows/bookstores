<template>
  <view class="container">
    <!-- 顶部导航和时间选择 -->
    <view class="header">
      <text class="title">系统数据分析</text>
      <picker mode="selector" :range="timeOptions" range-key="label" @change="handleTimeChange">
        <view class="time-picker">
          <text>{{ timeOptions[timeIndex].label }}</text>
          <uni-icons type="arrowdown" size="16" color="#666"></uni-icons>
        </view>
      </picker>
    </view>

    <!-- 数据加载状态 -->
    <view v-if="loading" class="loading-container">
      <uni-load-more status="loading" :contentText="{contentdown: '', contentrefresh: '加载中', contentnomore: ''}"></uni-load-more>
    </view>

    <!-- 主内容区域 -->
    <scroll-view v-else scroll-y class="content" @scrolltolower="loadMoreData">
      <!-- 系统概览卡片 -->
      <view class="card overview-card">
        <view class="card-header">
          <text class="card-title">系统概览</text>
        </view>
        <view class="overview-content">
          <view class="overview-item">
            <text class="overview-value">{{ overview.totalLogins || 0 }}</text>
            <text class="overview-label">总登录次数</text>
          </view>
          <view class="overview-item">
            <text class="overview-value">{{ overview.activeUsers || 0 }}</text>
            <text class="overview-label">活跃用户数</text>
          </view>
          <view class="overview-item">
            <text class="overview-value">{{ overview.totalSpent || 0 }}元</text>
            <text class="overview-label">总消费金额</text>
          </view>
        </view>
      </view>

      <!-- 位置分析 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">位置分析</text>
        </view>
        <view class="card-content">
          <view class="info-row">
            <text class="info-label">地区分布:</text>
            <text class="info-value">{{ locationStats.totalLocations || 0 }}个地区</text>
          </view>
          <view class="chart-container">
            <canvas canvas-id="locationChart" class="chart" id="locationChart"></canvas>
          </view>
        </view>
      </view>

      <!-- 消费分析 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">消费分析</text>
        </view>
        <view class="card-content">
          <view class="stats-grid">
            <view class="stat-item">
              <text class="stat-value">{{ purchaseStats.averageSpent || 0 }}元</text>
              <text class="stat-label">平均消费</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ purchaseStats.totalTransactions || 0 }}</text>
              <text class="stat-label">总交易数</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ purchaseStats.paymentDistribution ? Object.keys(purchaseStats.paymentDistribution).length : 0 }}</text>
              <text class="stat-label">支付方式</text>
            </view>
          </view>
          <view class="chart-container">
            <canvas canvas-id="purchaseChart" class="chart" id="purchaseChart"></canvas>
          </view>
        </view>
      </view>

      <!-- 登录分析 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">登录分析</text>
        </view>
        <view class="card-content">
          <view class="stats-grid">
            <view class="stat-item">
              <text class="stat-value">{{ loginStats.activeUsers || 0 }}</text>
              <text class="stat-label">活跃用户</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ loginStats.totalLogins || 0 }}</text>
              <text class="stat-label">总登录数</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ loginStats.hourlyDistribution ? Object.keys(loginStats.hourlyDistribution).length : 0 }}</text>
              <text class="stat-label">时段分布</text>
            </view>
          </view>
          <view class="chart-container">
            <canvas canvas-id="loginChart" class="chart" id="loginChart"></canvas>
          </view>
        </view>
      </view>

      <!-- 用户活跃度分析 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">用户活跃度</text>
        </view>
        <view class="card-content">
          <view class="activity-levels">
            <view class="level-item" v-for="(value, key) in activityStats.activityLevels" :key="key">
              <text class="level-label">{{ key }}</text>
              <text class="level-value">{{ value }}人</text>
            </view>
          </view>
          <view class="chart-container">
            <canvas canvas-id="activityChart" class="chart" id="activityChart"></canvas>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { initChart } from '@/utils/echarts-uni'
import * as echarts from 'echarts'
import { 
  getLocationAnalysis,
  getPurchaseAnalysis,
  getLoginAnalysis,
  getUserActivityAnalysis
} from '@/api/userAnalysis.js'

export default {
  data() {
    return {
      loading: true,
      timeOptions: [
        { label: '全部时间', value: null },
        { label: '最近7天', value: 7 },
        { label: '最近30天', value: 30 },
        { label: '最近90天', value: 90 }
      ],
      timeIndex: 0,
      locationStats: {},
      purchaseStats: {},
      loginStats: {},
      activityStats: {},
      overview: {},
      charts: {},
      resizeObservers: {},
      isPageReady: false
    }
  },
  onLoad() {
    this.loadData()
  },
  onReady() {
    this.isPageReady = true
    if (!this.loading) {
      this.initAllCharts()
    }
  },
  onShow() {
    this.handleResize()
  },
  onHide() {
    this.disposeResizeObservers()
  },
  onUnload() {
    this.disposeAllCharts()
    this.disposeResizeObservers()
  },
  methods: {
    handleTimeChange(e) {
      this.timeIndex = e.detail.value
      this.loadData()
    },
    
    async loadData() {
      this.loading = true
      const days = this.timeOptions[this.timeIndex].value
      
      try {
        const [locationRes, purchaseRes, loginRes, activityRes] = await Promise.all([
          getLocationAnalysis(days),
          getPurchaseAnalysis(days),
          getLoginAnalysis(days),
          getUserActivityAnalysis(days)
        ])
        
        if (locationRes.code === 1) {
          this.locationStats = locationRes.data || {}
        }
        
        if (purchaseRes.code === 1) {
          this.purchaseStats = purchaseRes.data || {}
        }
        
        if (loginRes.code === 1) {
          this.loginStats = loginRes.data || {}
        }
        
        if (activityRes.code === 1) {
          this.activityStats = activityRes.data || {}
        }
        
        this.overview = {
          totalLogins: this.loginStats.totalLogins || 0,
          activeUsers: this.loginStats.activeUsers || 0,
          totalSpent: this.purchaseStats.totalSpent || 0
        }
        
        // 如果页面已准备好，初始化图表
        if (this.isPageReady) {
          this.initAllCharts()
        }
        
      } catch (error) {
        console.error('加载数据失败:', error)
        uni.showToast({
          title: '加载数据失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    async initAllCharts() {
      await Promise.all([
        this.initChartWithRetry('locationChart', 'locationChart', this.generateLocationOptions),
        this.initChartWithRetry('purchaseChart', 'purchaseChart', this.generatePurchaseOptions),
        this.initChartWithRetry('loginChart', 'loginChart', this.generateLoginOptions),
        this.initChartWithRetry('activityChart', 'activityChart', this.generateActivityOptions)
      ])
    },
    
   // 在页面组件中修改initChartWithRetry方法
   async initChartWithRetry(chartName, canvasId, optionGenerator) {
     let retryCount = 0
     const MAX_RETRY = 5
     
     const init = async () => {
       try {
         const options = optionGenerator()
         
         // 销毁旧图表
         if (this.charts[chartName]) {
           this.charts[chartName].dispose()
         }
         
         // 确保DOM更新完成
         await this.$nextTick()
         
         // 获取容器元素并验证尺寸
         const containerInfo = await new Promise(resolve => {
           const query = uni.createSelectorQuery().in(this)
           query.select(`#${canvasId}`).boundingClientRect(res => {
             resolve(res)
           }).exec()
         })
         
         if (!containerInfo || containerInfo.width <= 10 || containerInfo.height <= 10) {
           throw new Error('容器尺寸过小或无效')
         }
         
         // 初始化新图表
         const result = await initChart(canvasId, this, options)
         if (!result) throw new Error('初始化失败')
         
         this.charts[chartName] = result
         
         // 强制立即重绘
         result.chart.resize()
         result.chart.setOption(options, true)
         
       } catch (error) {
         if (retryCount < MAX_RETRY) {
           retryCount++
           console.warn(`第${retryCount}次重试初始化图表: ${chartName}`)
           // 使用指数退避策略增加延迟时间
           setTimeout(init, 300 * Math.pow(2, retryCount - 1))
         } else {
           console.error(`图表初始化最终失败: ${chartName}`, error)
           uni.showToast({
             title: `图表${chartName}初始化失败`,
             icon: 'none'
           })
         }
       }
     }
     
     await init()
   },
    
    generateLocationOptions() {
      const data = this.locationStats.topLocations?.map(item => ({
        name: item.name || '未知地区',
        value: item.count || 0
      })) || []
      
      return {
        title: {
          text: '位置分布',
          left: 'center',
          textStyle: {
            fontSize: 14
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'middle',
          data: data.map(item => item.name),
          textStyle: {
            fontSize: 10
          },
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 5
        },
        series: [{
          name: '位置分布',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 1
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 12
            }
          },
          data: data
        }]
      }
    },
    
    generatePurchaseOptions() {
      const dates = this.purchaseStats.dailyTrend ? Object.keys(this.purchaseStats.dailyTrend).sort() : []
      const amounts = dates.map(date => this.purchaseStats.dailyTrend[date])
      
      return {
        title: {
          text: '消费趋势',
          left: 'center',
          textStyle: {
            fontSize: 14
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>消费: {c}元'
        },
        grid: {
          left: '10%',
          right: '10%',
          top: '20%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: {
            rotate: 30,
            fontSize: 10
          }
        },
        yAxis: {
          type: 'value',
          name: '消费金额(元)',
          axisLabel: {
            fontSize: 10
          }
        },
        series: [{
          data: amounts,
          type: 'bar',
          barWidth: '60%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          }
        }]
      }
    },
    
    generateLoginOptions() {
      const hours = this.loginStats.hourlyDistribution ? Object.keys(this.loginStats.hourlyDistribution).sort() : []
      const counts = hours.map(hour => this.loginStats.hourlyDistribution[hour])
      
      return {
        title: {
          text: '登录时段分布',
          left: 'center',
          textStyle: {
            fontSize: 14
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}点<br/>登录次数: {c}次'
        },
        grid: {
          left: '10%',
          right: '10%',
          top: '20%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: hours.map(h => `${h}时`),
          boundaryGap: false,
          axisLabel: {
            fontSize: 10
          }
        },
        yAxis: {
          type: 'value',
          name: '登录次数',
          axisLabel: {
            fontSize: 10
          }
        },
        series: [{
          data: counts,
          type: 'line',
          smooth: true,
          lineStyle: {
            width: 2,
            color: '#1890ff'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(24, 144, 255, 0.6)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
            ])
          }
        }]
      }
    },
    
    generateActivityOptions() {
      const data = this.activityStats.activityLevels ? 
        Object.entries(this.activityStats.activityLevels).map(([name, value]) => ({
          name,
          value
        })) : []
      
      return {
        title: {
          text: '用户活跃度',
          left: 'center',
          textStyle: {
            fontSize: 14
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c}人 ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'middle',
          data: data.map(item => item.name),
          textStyle: {
            fontSize: 10
          },
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 5
        },
        series: [{
          name: '用户活跃度',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          roseType: 'radius',
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 1
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 12
            }
          },
          data: data
        }]
      }
    },

    handleResize() {
      Object.values(this.charts).forEach(item => {
        item?.resize?.()
      })
    },
    
    disposeAllCharts() {
      Object.values(this.charts).forEach(item => {
        item?.dispose?.()
      })
      this.charts = {}
    },
    
    disposeResizeObservers() {
      Object.values(this.resizeObservers).forEach(observer => {
        observer?.disconnect?.()
      })
      this.resizeObservers = {}
    },
    
    loadMoreData() {
      // 分页加载实现
    }
  }
}
</script>

<style scoped>
.container {
  padding: 10rpx;
  background-color: #f7f8fa;
  min-height: 100vh;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.time-picker {
  display: flex;
  align-items: center;
  padding: 6rpx 16rpx;
  background-color: #f5f5f5;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #666;
}

.loading-container {
  padding: 30rpx 0;
  display: flex;
  justify-content: center;
}

.content {
  height: calc(100vh - 100rpx);
  -webkit-overflow-scrolling: touch;
}

.card {
  background-color: #fff;
  border-radius: 10rpx;
  margin-bottom: 16rpx;
  padding: 16rpx;
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  padding-bottom: 12rpx;
  border-bottom: 1rpx solid #f5f5f5;
  margin-bottom: 12rpx;
}

.card-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.card-content {
  padding: 8rpx 0;
}

.overview-card {
  margin-top: 8rpx;
}

.overview-content {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
}

.overview-item {
  flex: 1;
  text-align: center;
}

.overview-value {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #4a9ff5;
  margin-bottom: 8rpx;
}

.overview-label {
  display: block;
  font-size: 22rpx;
  color: #999;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.info-label {
  font-size: 24rpx;
  color: #666;
  margin-right: 12rpx;
}

.info-value {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.stat-item {
  background-color: #f9f9f9;
  padding: 12rpx;
  border-radius: 10rpx;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 26rpx;
  font-weight: bold;
  color: #4a9ff5;
  margin-bottom: 6rpx;
}

.stat-label {
  display: block;
  font-size: 20rpx;
  color: #999;
}

.activity-levels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.level-item {
  flex: 1;
  text-align: center;
  padding: 8rpx;
}

.level-label {
  display: block;
  font-size: 22rpx;
  color: #666;
  margin-bottom: 4rpx;
}

.level-value {
  display: block;
  font-size: 24rpx;
  font-weight: bold;
  color: #ee6666;
}

/* 图表容器核心样式 */
.chart-container {
  width: 100%;
  height: 300rpx;
  position: relative;
  background-color: #f9f9f9;
  border-radius: 8rpx;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart {
  width: 100% !important;
  height: 100% !important;
}
/* 图表容器核心样式 */
.chart-container {
  width: 100%;
  height: 300rpx;
  position: relative;
  background-color: #f9f9f9;
  border-radius: 8rpx;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  margin: 10rpx 0;
}

.chart {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

/* 图表容器核心样式 - 更紧凑的布局 */
.chart-container {
  width: 100%;
  height: 260rpx; /* 从300rpx减小到260rpx */
  position: relative;
  background-color: #f9f9f9;
  border-radius: 6rpx;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  margin: 8rpx 0; /* 减小外边距 */
  padding: 4rpx; /* 减小内边距 */
}

.chart {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

/* 确保canvas元素有明确的尺寸 */
canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

/* 响应式调整 - 更紧凑的布局 */
@media (max-width: 500px) {
  .chart-container {
    height: 240rpx; /* 从280rpx减小到240rpx */
  }
}

@media (min-width: 768px) {
  .chart-container {
    height: 300rpx; /* 从350rpx减小到300rpx */
  }
}

/* 横屏适配 - 更紧凑的布局 */
@media (orientation: landscape) {
  .chart-container {
    height: 200rpx !important; /* 从250rpx减小到200rpx */
  }
}
</style>