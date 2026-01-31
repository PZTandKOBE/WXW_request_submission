import router from './index'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'

const whiteList = ['/login']

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const hasToken = userStore.token

  if (hasToken) {
    if (to.path === '/login') {
      // 修正逻辑：只有当角色明确时才跳转，否则放行（让他重新登录）或者登出
      if (userStore.role === 'administrator') {
        next('/admin/dashboard')
      } else if (userStore.role === 'officer') {
        next('/officer/workspace')
      } else {
        // 关键修正：如果有Token但没角色，说明数据坏了，执行登出并留在登录页
        userStore.logout()
        next() 
      }
    } else {
      // 权限校验
      const requiredRoles = to.meta.roles
      
      // 关键修正：确保 userStore.role 存在才进行匹配
      if (requiredRoles && requiredRoles.length > 0) {
        if (userStore.role && requiredRoles.includes(userStore.role)) {
          next()
        } else {
          ElMessage.error('无权访问或身份信息已过期')
          // 校验失败，踢回登录页（因为上面已经处理了 /login 的逻辑，这里不会死循环了）
          next(`/login?redirect=${to.path}`)
        }
      } else {
        next()
      }
    }
  } else {
    // 未登录
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?code=${to.query.code || ''}`)
    }
  }
})