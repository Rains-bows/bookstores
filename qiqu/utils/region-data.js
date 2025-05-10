import { regionData } from 'element-china-area-data'

// 转换数据格式为原生选择器需要的格式
export const getRegionLabels = () => {
  const provinces = regionData.map(province => province.label)
  const cities = {}
  const districts = {}
  
  regionData.forEach(province => {
    cities[province.label] = province.children.map(city => city.label)
    province.children.forEach(city => {
      districts[city.label] = city.children.map(district => district.label)
    })
  })
  
  return {
    provinces,
    cities,
    districts
  }
}

// 缓存机制
let regionCache = null

export const getRegionDataFromCache = () => {
  if (!regionCache) {
    regionCache = getRegionLabels()
  }
  return regionCache
} 