import { request } from '@/utils/request'

// 上传文件
export const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: baseURL + '/upload', // 从配置中获取baseURL
      filePath: file,
      name: 'image',
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if(data.status === 1) {
            resolve(data)
          } else {
            uni.showToast({
              title: data.message || '上传失败',
              icon: 'none'
            })
            reject(new Error(data.message))
          }
        } catch(e) {
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          })
          reject(e)
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '上传失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
} 