// App.js 主逻辑
import { createSSRApp } from 'vue'
import App from './App.vue'
import { whiteList } from './config'

// 增强版浏览器环境检测
const browserDetector = {
  timers: new Set(),
  
  isWeChatBrowser() {
    if (this.isQQBrowser()) return false // 优先排除QQ浏览器
    if (document.readyState !== 'complete') return false
    return this.hasWechatUA() && this.hasWechatAPI()
  },

  hasWechatUA() {
    return /micromessenger/i.test(navigator.userAgent)
  },

  hasWechatAPI() {
    return typeof WeixinJSBridge !== 'undefined'
  },

  isQQBrowser() {
    const ua = navigator.userAgent
    return (
      /(QQBrowser|MQQBrowser|TBS\/[\d.]+)/i.test(ua) ||
      navigator.vendor.includes('Tencent') 
    )
  },

  addTimer(timer) {
    this.timers.add(timer)
  },

  safeClearTimers() {
    this.timers.forEach(timer => {
      clearInterval(timer)
      clearTimeout(timer)
    })
    this.timers.clear()
  }
}

// 增强路由拦截器
const createRouteInterceptor = () => {
  let isHandling = false

  const validateParams = (url) => {
    try {
      const params = new URLSearchParams(url.split('?')[1])
      return params.get('from') === 'external' && 
             Date.now() - params.get('t') < 60000
    } catch {
      return false
    }
  }

  return {
    invoke: (args) => {
      if (isHandling) return true
      
      const { url } = args
      isHandling = true

      // 参数验证放行
      if (validateParams(url)) {
        isHandling = false
        return true
      }

      // QQ浏览器直接放行
      if (browserDetector.isQQBrowser()) {
        isHandling = false
        return true
      }

      // 微信环境处理
      if (browserDetector.isWeChatBrowser()) {
        uni.reLaunch({ 
          url: `/pages/yindao/yindao?from=wechat&t=${Date.now()}` 
        })
        isHandling = false
        return false
      }

      // 正常流程处理
      const [path] = url.split('?')
      if (whiteList.includes(path)) return true
      if (!uni.getStorageSync('token')) {
        uni.redirectTo({ url: '/pages/login/login' })
        return false
      }
      return true
    }
  }
}

const registerInterceptors = () => {
  const interceptor = createRouteInterceptor()
  uni.addInterceptor('navigateTo', interceptor)
  uni.addInterceptor('reLaunch', interceptor)
}

export function createApp() {
  const app = createSSRApp(App)
  setTimeout(registerInterceptors, 50)
  return { app }
}