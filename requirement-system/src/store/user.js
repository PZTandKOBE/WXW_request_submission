import { defineStore } from 'pinia'
import { login as loginApi } from '../api/auth'
import { getUserInfo } from '../api/user'

export const useUserStore = defineStore('user', {
  persist: true, // 开启持久化，刷新页面不丢失状态
  state: () => ({
    token: '',
    // 权限相关
    role: '',       // 'administrator' | 'officer' (用于前端路由鉴权)
    roleId: null,   // 1 | 2 (后端原始ID)
    // 基础信息
    name: '',
    department: '',
    departmentId: null,
    avatar: '',
    email: '',
    phone: '',
    userId: null,   // 学号/工号 (如 202410098042)
    grade: null
  }),
  actions: {
    // 登录并获取用户信息
    async login(code) {
      try {
        // 1. 换取 Token
        const loginRes = await loginApi({ code })
        // 兼容不同接口格式 (有的直接返token串，有的在对象的token字段里)
        this.token = loginRes.token || loginRes
        
        if (!this.token) throw new Error('Token 获取失败')

        // 2. 获取详细用户信息
        // 注意：根据 request.js 的拦截器，这里可能已经解了一层包
        const res = await getUserInfo()
        
        // 容错处理：确保拿到的是 data 内部的那个对象
        // 如果 request.js 返回的是 res.data，那这里直接用；如果没解包，取 res.data
        const userInfo = res.data || res 

        console.log('当前登录用户信息:', userInfo)

        // 3. 核心权限逻辑修改 (1=干事, 2=管理员)
        this.roleId = userInfo.roleId
        
        if (this.roleId === 2) {
          this.role = 'administrator' // 映射为路由中的角色名
        } else if (this.roleId === 1) {
          this.role = 'officer'
        } else {
          this.role = 'guest' // 无权限用户
          console.warn('未知 RoleId:', this.roleId)
        }

        // 4. 填充其他字段
        this.name = userInfo.username
        this.userId = userInfo.id
        this.department = userInfo.department
        this.departmentId = userInfo.departmentId
        this.avatar = userInfo.avatar
        this.email = userInfo.email
        this.phone = userInfo.phone
        this.grade = userInfo.grade

        return userInfo
      } catch (error) {
        console.error('登录流程异常:', error)
        throw error
      }
    },

    // 登出
    logout() {
      this.$reset()
      localStorage.clear()
    }
  }
})