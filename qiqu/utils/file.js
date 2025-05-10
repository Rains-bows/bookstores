// 选择图片
export const chooseImage = (count = 1) => {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        resolve(res.tempFilePaths)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

// 预览图片
export const previewImage = (urls, current) => {
  uni.previewImage({
    urls: typeof urls === 'string' ? [urls] : urls,
    current
  })
} 