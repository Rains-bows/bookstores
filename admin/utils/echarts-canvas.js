// 获取适合uni-app的canvas对象
export const getCanvas = (canvasId, vm) => {
  return new Promise((resolve) => {
    // 在H5环境下
    if (process.env.VUE_APP_PLATFORM === 'h5') {
      const canvas = document.getElementById(canvasId)
      if (canvas) {
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
        resolve(canvas)
      } else {
        console.warn(`Canvas元素 ${canvasId} 未找到`)
        resolve(null)
      }
    } 
    // 在小程序环境下
    else {
      const query = uni.createSelectorQuery().in(vm)
      query.select(`#${canvasId}`).fields({
        node: true,
        size: true
      }, (res) => {
        if (res && res.node) {
          const canvas = res.node
          const ctx = canvas.getContext('2d')
          const dpr = uni.getSystemInfoSync().pixelRatio
          canvas.width = res.width * dpr
          canvas.height = res.height * dpr
          ctx.scale(dpr, dpr)
          resolve(canvas)
        } else {
          console.warn(`Canvas元素 ${canvasId} 未找到`)
          resolve(null)
        }
      }).exec()
    }
  })
}