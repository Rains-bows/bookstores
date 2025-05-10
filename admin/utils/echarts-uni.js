import * as echarts from 'echarts/core'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  CanvasRenderer
])

export function initChart(canvasId, vm, options) {
  return new Promise((resolve) => {
    const init = () => {
      const query = uni.createSelectorQuery().in(vm)
      query.select(`#${canvasId}`)
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res || !res[0] || !res[0].node) {
            console.warn(`Canvas元素未找到: ${canvasId}, 将在下一帧重试`)
            requestAnimationFrame(init)
            return
          }

          const canvas = res[0].node
          const container = res[0].node.parentElement
          const systemInfo = uni.getSystemInfoSync()
          
          // 极致紧凑的尺寸计算
          let containerWidth = Math.floor(container.clientWidth || systemInfo.windowWidth * 0.98)
          let containerHeight = Math.floor(container.clientHeight || containerWidth * 0.3) // 高度比例调整为0.3
          
          // 最小高度极致压缩
          const minHeight = systemInfo.windowHeight * 0.12
          containerHeight = Math.max(containerHeight, minHeight)
          
          const dpr = systemInfo.pixelRatio

          // 精确到像素的尺寸设置
          canvas.width = Math.floor(containerWidth * dpr)
          canvas.height = Math.floor(containerHeight * dpr)
          canvas.style.width = `${containerWidth}px`
          canvas.style.height = `${containerHeight}px`

          // 初始化图表（极致紧凑模式）
          const chart = echarts.init(canvas, null, {
            width: containerWidth,
            height: containerHeight,
            devicePixelRatio: dpr,
            renderer: 'canvas'
          })

          // 最小化字体和间距
          const baseFontSize = Math.max(5, containerWidth / 45)
          const processedOptions = processUltraCompactOptions(options, baseFontSize, containerWidth, containerHeight)
          
          // 强制完全重新渲染
          chart.setOption(processedOptions, {
            notMerge: true,
            lazyUpdate: false,
            silent: false
          })

          // 处理窗口大小变化
          const handleResize = () => {
            const newWidth = Math.floor(container.clientWidth || containerWidth)
            let newHeight = Math.floor(container.clientHeight || containerHeight)
            
            newHeight = Math.max(newHeight, minHeight)
            
            if (newWidth > 0 && newHeight > 0) {
              const newDPR = systemInfo.pixelRatio
              
              canvas.width = Math.floor(newWidth * newDPR)
              canvas.height = Math.floor(newHeight * newDPR)
              canvas.style.width = `${newWidth}px`
              canvas.style.height = `${newHeight}px`
              
              const newOptions = processUltraCompactOptions(
                options, 
                Math.max(5, newWidth / 45), 
                newWidth, 
                newHeight
              )
              
              chart.setOption(newOptions, true)
              chart.resize()
            }
          }

          // 紧凑的resize监听
          let resizeTimer = null
          const resizeObserver = new ResizeObserver(() => {
            clearTimeout(resizeTimer)
            resizeTimer = setTimeout(handleResize, 150)
          })
          resizeObserver.observe(container)

          resolve({
            chart,
            dispose: () => {
              resizeObserver.disconnect()
              chart.dispose()
            },
            resize: handleResize
          })
        })
    }

    setTimeout(init, 0)
  })
}

// 极致紧凑的options处理（确保数据显示完整）
function processUltraCompactOptions(options, baseFontSize, width, height) {
  const processedOptions = JSON.parse(JSON.stringify(options))
  const isSmallScreen = width < 400
  const isTinyScreen = width < 300
  
  // 最小化文本样式（确保可读性）
  const microTextStyle = {
    fontSize: baseFontSize,
    color: '#666'
  }
  
  // 标题极致压缩但确保显示
  if (processedOptions.title) {
    processedOptions.title.textStyle = {
      fontSize: isTinyScreen ? baseFontSize * 0.8 : baseFontSize,
      padding: [0, 0, 0, 0]
    }
    processedOptions.title.top = '0%'
    processedOptions.title.left = 'center'
  }
  
  // 图例极致压缩但确保显示完整
  if (processedOptions.legend) {
    processedOptions.legend.textStyle = {
      fontSize: isTinyScreen ? baseFontSize * 0.6 : baseFontSize * 0.7
    }
    processedOptions.legend.itemWidth = isTinyScreen ? 6 : 8
    processedOptions.legend.itemHeight = isTinyScreen ? 6 : 8
    processedOptions.legend.itemGap = 2
    
    if (isSmallScreen) {
      processedOptions.legend.orient = 'vertical'
      processedOptions.legend.right = '0%'
      processedOptions.legend.top = '15%'
      // 确保图例文本不截断
      processedOptions.legend.formatter = function(name) {
        return name.length > 6 ? name.substring(0, 4) + '...' : name
      }
    } else {
      processedOptions.legend.bottom = '0%'
    }
  }
  
  // 坐标轴极致压缩但确保显示完整
  const axisLabelConfig = {
    fontSize: isTinyScreen ? baseFontSize * 0.5 : baseFontSize * 0.6,
    interval: 0, // 强制显示所有标签
    rotate: isSmallScreen ? 30 : 0,
    margin: 1,
    // 确保长文本显示
    formatter: function(value) {
      return value.length > 4 ? value.substring(0, 3) + '..' : value
    }
  }
  
  // X轴处理（确保名称显示）
  if (processedOptions.xAxis) {
    if (Array.isArray(processedOptions.xAxis)) {
      processedOptions.xAxis.forEach(axis => {
        axis.axisLabel = axisLabelConfig
        axis.nameTextStyle = { 
          fontSize: baseFontSize * 0.6,
          padding: [2, 0, 0, 0] // 确保名称显示
        }
      })
    } else {
      processedOptions.xAxis.axisLabel = axisLabelConfig
      processedOptions.xAxis.nameTextStyle = { 
        fontSize: baseFontSize * 0.6,
        padding: [2, 0, 0, 0] // 确保名称显示
      }
    }
  }
  
  // Y轴处理（确保名称显示）
  if (processedOptions.yAxis) {
    if (Array.isArray(processedOptions.yAxis)) {
      processedOptions.yAxis.forEach(axis => {
        axis.axisLabel = { 
          fontSize: baseFontSize * 0.6,
          margin: 2 // 确保数值显示
        }
        axis.nameTextStyle = { 
          fontSize: baseFontSize * 0.6,
          padding: [0, 0, 0, 2] // 确保名称显示
        }
      })
    } else {
      processedOptions.yAxis.axisLabel = { 
        fontSize: baseFontSize * 0.6,
        margin: 2
      }
      processedOptions.yAxis.nameTextStyle = { 
        fontSize: baseFontSize * 0.6,
        padding: [0, 0, 0, 2]
      }
    }
  }
  
  // 提示框压缩但确保信息完整
  if (processedOptions.tooltip) {
    processedOptions.tooltip.textStyle = { 
      fontSize: baseFontSize * 0.7,
      lineHeight: baseFontSize * 1.2
    }
    processedOptions.tooltip.extraCssText = `max-width: ${width * 0.7}px; padding: 3px;`
    // 确保完整显示数据
    processedOptions.tooltip.formatter = function(params) {
      if (Array.isArray(params)) {
        return params.map(p => `${p.seriesName}: ${p.value}`).join('<br/>')
      }
      return `${params.seriesName}<br/>${params.name}: ${params.value}`
    }
  }
  
  // 系列数据压缩但确保显示
  if (processedOptions.series) {
    processedOptions.series.forEach(series => {
      // 确保标签显示完整
      if (series.label) {
        series.label.fontSize = baseFontSize * 0.6
        series.label.show = true // 强制显示标签
        series.label.formatter = '{c}' // 只显示数值
        series.label.position = 'inside' // 内置显示节省空间
      }
      
      // 饼图调整（确保数据显示）
      if (series.type === 'pie') {
        series.center = ['50%', '45%']
        series.radius = isTinyScreen ? ['20%', '50%'] : ['25%', '55%']
        // 确保标签显示
        series.label = series.label || {}
        series.label.show = true
        series.label.formatter = '{b}: {c}'
        series.label.fontSize = baseFontSize * 0.6
        series.avoidLabelOverlap = false // 禁用自动避让
      }
      
      // 柱状图宽度调整
      if (series.type === 'bar') {
        series.barWidth = isTinyScreen ? 5 : 7
        // 确保标签显示
        series.label = series.label || {}
        series.label.show = true
        series.label.position = 'top'
        series.label.fontSize = baseFontSize * 0.5
      }
      
      // 折线图调整
      if (series.type === 'line') {
        series.lineStyle = { width: 1.2 }
        series.symbolSize = isTinyScreen ? 3 : 4
        // 确保标签显示
        series.label = series.label || {}
        series.label.show = true
        series.label.fontSize = baseFontSize * 0.5
      }
    })
  }
  
  // 网格极致压缩但确保内容显示
  const gridConfig = {
    left: '2%',
    right: '2%',
    top: '15%',
    bottom: '15%',
    containLabel: true
  }
  
  processedOptions.grid = Array.isArray(processedOptions.grid) 
    ? processedOptions.grid.map(g => ({ ...g, ...gridConfig }))
    : { ...processedOptions.grid, ...gridConfig }
  
  return processedOptions
}