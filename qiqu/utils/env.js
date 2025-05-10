// utils/env.js
export const globalEnv = {
  isIOS() {
    return !!navigator.userAgent.match(/(iPhone|iPad|ipod)/i);
  },
  
  isWeChat() {
    return !!window.navigator.userAgent.match(/(MicroMessenger|WeChat)/i);
  },
  
  isMiniProgram() {
    return !!window.wx && !!window.wx.config;
  },
  
  isH5() {
    return !this.isMiniProgram() && !this.isWeChat() && !this.isIOS() && !this.isAndroid();
  },
  
  isAndroid() {
    return !!navigator.userAgent.match(/Android/i);
  },
  
  getEnv() {
    let result = 'unknown';
    
    if (this.isApp()) result = 'app';
    else if (this.isMiniProgram()) result = 'mini';
    else if (this.isWeChat()) result = 'wechat';
    else if (this.isH5()) result = 'h5';
    else result = 'web';
    
    // 添加设备类型标识
    result += this.isMobile() ? '-mobile' : '-pc';
    return result;
  },
  
  isApp() {
    return !!window.plus && !!window.plus.runtime;
  },
  
  isMobile() {
    return !!navigator.userAgent.match(/Mobi|Android/i);
  }
};

// 全局注册
if (typeof uni !== 'undefined') {
  uni.globalEnv = globalEnv;
} else {
  window.globalEnv = globalEnv;
}