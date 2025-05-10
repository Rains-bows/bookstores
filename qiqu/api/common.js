import { request } from '@/utils/request'

// 获取地区数据
export const getRegionData = () => {
  return request({
    url: '/common/region',
    method: 'GET'
  })
} 