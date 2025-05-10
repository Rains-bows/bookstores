/**
 * 防抖函数
 * @param {Function} fn 需要防抖的函数
 * @param {Number} delay 延迟时间,单位毫秒
 * @returns {Function} 返回新的防抖函数
 */
export default function debounce(fn, delay = 300) {
  let timer = null
  
  return function(...args) {
    if (timer) {
      clearTimeout(timer)
    }
    
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
} 