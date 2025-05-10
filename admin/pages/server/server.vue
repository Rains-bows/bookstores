<template>
  <view class="monitor-container">
    <!-- 状态指标卡片 -->
    <uni-grid :column="3" :highlight="false" class="status-grid">
      <uni-grid-item v-for="(item, index) in statusData" :key="index">
        <view class="status-card">
          <view class="metric-header">
            <uni-icons 
              :type="item.icon" 
              :color="getStatusColor(item.value)" 
              size="30"
            ></uni-icons>
            <text class="metric-title">{{ item.label }}</text>
          </view>
          <text class="metric-value">{{ Number(item.value).toFixed(1) }}%</text>
          <view class="progress-bar">
            <view 
              class="progress-inner" 
              :style="{
                width: item.value + '%',
                backgroundColor: getStatusColor(item.value)
              }"
            ></view>
          </view>
        </view>
      </uni-grid-item>
    </uni-grid>

    <!-- 服务器列表 -->
    <view class="server-list">
      <view class="list-header">
        <text class="title">服务器列表</text>
        <uni-icons 
          type="plus" 
          size="28" 
          color="#6366f1" 
          @click="showAddForm"
        ></uni-icons>
      </view>

      <uni-list>
        <uni-list-item 
          v-for="server in servers" 
          :key="server.id"
          :title="server.name" 
          :note="server.ip"
        >
          <template v-slot:footer>
            <view class="status-container">
              <view 
                class="status-indicator" 
                :class="server.status"
              ></view>
              <text :class="['status-text', server.status]">
                {{ server.status.toUpperCase() }}
              </text>
            </view>
          </template>
        </uni-list-item>
      </uni-list>
    </view>

    <!-- 添加服务器弹窗 -->
    <uni-popup ref="addForm" type="dialog">
      <uni-popup-dialog 
        mode="input" 
        title="添加服务器" 
        :value="formData"
        @confirm="addServer"
      >
        <view class="form-content">
          <uni-forms :model="formData">
            <uni-forms-item label="服务器名称">
              <uni-easyinput 
                v-model="formData.name" 
                placeholder="请输入名称"
              />
            </uni-forms-item>
            <uni-forms-item label="IP地址">
              <uni-easyinput 
                v-model="formData.ip" 
                placeholder="请输入IP" 
              />
            </uni-forms-item>
          </uni-forms>
        </view>
      </uni-popup-dialog>
    </uni-popup>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusData: [
        { label: 'CPU使用率', icon: 'stats-bars', value: 25.0 },
        { label: '内存占用', icon: 'piegraph', value: 45.0 },
        { label: '磁盘空间', icon: 'harddrive', value: 65.0 }
      ],
      servers: [],
      formData: {
        name: '',
        ip: ''
      },
      simulationTimer: null
    }
  },
  mounted() {
    this.initDemoData()
    this.startDataSimulation()
  },
  beforeDestroy() {
    clearInterval(this.simulationTimer)
  },
  methods: {
    initDemoData() {
      // 初始化演示服务器（带性能指标）
      this.servers = [
        { 
          id: 1, 
          name: '核心数据库', 
          ip: '192.168.1.101', 
          status: 'online',
          cpu: 28.5,
          ram: 62.3,
          disk: 45.7
        },
        { 
          id: 2, 
          name: '备份服务器', 
          ip: '192.168.1.102', 
          status: 'offline',
          cpu: 0.0,
          ram: 0.0,
          disk: 0.0
        }
      ]
    },

    startDataSimulation() {
      this.simulationTimer = setInterval(() => {
        // 安全数值处理
        this.statusData = this.statusData.map(item => {
          const current = Number(item.value) || 0
          const fluctuation = (Math.random() * 4 - 2) // -2到+2的波动
          const newValue = Math.min(100, Math.max(0, current + fluctuation))
          return { ...item, value: newValue }
        })

        // 服务器状态模拟（带异常处理）
        this.servers = this.servers.map(server => {
          try {
            const isOnline = Math.random() < 0.98 // 98%在线概率
            const newStatus = isOnline ? 'online' : 'offline'
            
            return {
              ...server,
              status: newStatus,
              cpu: this.calcServerMetric(server.cpu, 20, 80),
              ram: this.calcServerMetric(server.ram, 30, 70),
              disk: this.calcServerMetric(server.disk, 10, 90)
            }
          } catch (e) {
            console.error('服务器状态更新错误:', e)
            return server
          }
        })
      }, 1500)
    },

    calcServerMetric(current, min, max) {
      const base = current || min
      const fluctuation = (Math.random() * 5 - 2.5) // -2.5到+2.5波动
      return Math.min(max, Math.max(min, base + fluctuation))
    },

    getStatusColor(value) {
      const num = Number(value)
      if (num > 85) return '#ff4d4f'
      if (num > 65) return '#faad14'
      return '#52c41a'
    },

    showAddForm() {
      this.formData = { name: '', ip: '' }
      this.$refs.addForm.open()
    },

    addServer() {
      if (!this.formData.name || !this.formData.ip) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' })
        return
      }

      // 生成带初始指标的服务器
      const initialMetrics = {
        cpu: Math.random() * 20 + 20,
        ram: Math.random() * 30 + 30,
        disk: Math.random() * 20 + 40
      }

      this.servers.push({
        id: Date.now(),
        ...this.formData,
        ...initialMetrics,
        status: Math.random() > 0.1 ? 'online' : 'offline'
      })

      this.$refs.addForm.close()
      uni.showToast({ title: '服务器添加成功' })
    }
  }
}
</script>

<style lang="scss" scoped>
.monitor-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.status-grid {
  margin-bottom: 30rpx;
  
  .status-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin: 10rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
    
    .metric-header {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;
      
      .metric-title {
        font-size: 28rpx;
        color: #666;
        margin-left: 16rpx;
      }
    }
    
    .metric-value {
      font-size: 40rpx;
      font-weight: bold;
      color: #333;
      margin: 8rpx 0;
    }
    
    .progress-bar {
      height: 8rpx;
      background: #eee;
      border-radius: 4rpx;
      overflow: hidden;
      
      .progress-inner {
        height: 100%;
        transition: width 0.8s ease;
      }
    }
  }
}

.server-list {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .title {
      font-size: 32rpx;
      font-weight: 500;
    }
  }
}

.status-container {
  display: flex;
  align-items: center;
  
  .status-indicator {
    width: 20rpx;
    height: 20rpx;
    border-radius: 50%;
    margin-right: 12rpx;
    animation: pulse 1.5s infinite;
    
    &.online {
      background: #52c41a;
      box-shadow: 0 0 8rpx rgba(82, 196, 26, 0.3);
    }
    
    &.offline {
      background: #ff4d4f;
      box-shadow: 0 0 8rpx rgba(255, 77, 79, 0.3);
    }
  }
  
  .status-text {
    font-size: 26rpx;
    
    &.online {
      color: #52c41a;
    }
    
    &.offline {
      color: #ff4d4f;
    }
  }
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.form-content {
  padding: 24rpx;
}
</style>