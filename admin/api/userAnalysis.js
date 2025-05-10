import request from '@/utils/request'

/**
 * 获取系统设备分析数据
 * @param {number} [days] - 可选，最近多少天的数据
 * @returns {Promise} 包含设备分析数据的Promise
 */
export const getDeviceAnalysis = (days) => {
  return request({
    url: '/system/analysis/device',
    method: 'GET',
    params: { days }
  })
}

/**
 * 获取系统位置分析数据
 * @param {number} [days] - 可选，最近多少天的数据
 * @returns {Promise} 包含位置分析数据的Promise
 */
export const getLocationAnalysis = (days) => {
  return request({
    url: '/system/analysis/location',
    method: 'GET',
    params: { days }
  })
}

/**
 * 获取系统消费分析数据
 * @param {number} [days] - 可选，最近多少天的数据
 * @returns {Promise} 包含消费分析数据的Promise
 */
export const getPurchaseAnalysis = (days) => {
  return request({
    url: '/system/analysis/purchase',
    method: 'GET',
    params: { days }
  })
}

/**
 * 获取系统登录分析数据
 * @param {number} [days] - 可选，最近多少天的数据
 * @returns {Promise} 包含登录分析数据的Promise
 */
export const getLoginAnalysis = (days) => {
  return request({
    url: '/system/analysis/login',
    method: 'GET',
    params: { days }
  })
}

/**
 * 获取用户活跃度分析数据
 * @param {number} [days] - 可选，最近多少天的数据
 * @returns {Promise} 包含活跃度分析数据的Promise
 */
export const getUserActivityAnalysis = (days) => {
  return request({
    url: '/system/analysis/user-activity',
    method: 'GET',
    params: { days }
  })
}