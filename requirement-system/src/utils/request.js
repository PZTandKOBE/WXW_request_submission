import axios from 'axios'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const service = axios.create({
  // 使用环境变量中的 /check
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  timeout: 10000 
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      // 根据手册 2.2 章节，注入 Bearer Token
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // 假设后端标准返回结构为 { code: 0, data: ..., message: ... }
    // 根据文档，大部分成功返回 code: 0 或 200 (需根据后端实际调整，文档中有些混用)
    if (res.code !== 0 && res.code !== 200) {
      ElMessage.error(res.message || '系统错误')
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res.data
  },
  (error) => {
    // 处理 403/401 等错误
    if (error.response && error.response.status === 403) {
      ElMessage.error('没有权限执行此操作')
    } else {
      ElMessage.error(error.message || '网络请求失败')
    }
    return Promise.reject(error)
  }
)

export default service