import request from '../utils/request'

// 获取个人信息
export function getUserInfo() {
  return request({
    // 对应后端路径: /permission/user/information
    url: '/permission/user/information', 
    method: 'get',
    // 必须覆盖默认的 /check，使用根路径，让 Vite 的 /permission 代理生效
    baseURL: '/' 
  })
}

// 补充信息 (逻辑同上，假设也是 permission 开头)
export function supplementInfo(data) {
  return request({
    url: '/permission/InformationSupplement',
    method: 'post',
    baseURL: '/',
    data
  })
}