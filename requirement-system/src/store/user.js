import { defineStore } from 'pinia'
import { login as loginApi } from '../api/auth'

export const useUserStore = defineStore('user', {
  // 开启持久化，刷新页面不丢失 Token
  persist: true, 
  state: () => ({
    token: '',
    role: '', // 'administrator' | 'officer'
    name: '',
    departmentId: null
  }),
  actions: {
    // 登录动作
    async login(code) {
      try {
        const data = await loginApi({ code })
        // 假设后端返回结构包含 token 和 user 信息
        // 根据文档 POST /login 返回结构未详细展开，这里依据常规逻辑编写
        this.token = data.token 
        this.role = data.role 
        this.name = data.username
        this.departmentId = data.departmentId
        return data
      } catch (error) {
        throw error
      }
    },
    // 登出
    logout() {
      this.token = ''
      this.role = ''
      this.name = ''
      localStorage.clear()
    }
  }
})