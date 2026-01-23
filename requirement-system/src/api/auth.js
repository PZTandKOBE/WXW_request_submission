import request from '../utils/request'

export function login(data) {
  return request({
    url: '/login', // 加上baseURL后为 /check/login
    method: 'post',
    data // body: { code: "..." }
  })
}