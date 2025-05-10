// 上传图片
export function uploadImage(file) {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: 'https://lapper.site/api/upload',
	  // url:'http://localhost:8080/api/upload',
      filePath: file.path,
      name: 'image',
      formData: {
        'filename': file.name || 'image.jpg'
      },
      header: {
        'Authorization': uni.getStorageSync('token')
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          resolve(data)
        } catch (error) {
          reject(new Error('解析响应数据失败'))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
} 