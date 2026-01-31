import request from '../utils/request'

export function login(data) {
  return request({
    // 修改这里：加上前缀，避开前端路由冲突
    url: '/api-auth/login', 
    method: 'post',
    // 覆盖 baseURL，确保不走 /check
    baseURL: '/',     
    data
  })
}