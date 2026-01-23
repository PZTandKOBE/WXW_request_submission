import router from './index'
import { useUserStore } from '../store/user'

const whiteList = ['/login'] // 白名单

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const hasToken = userStore.token

  if (hasToken) {
    if (to.path === '/login') {
      // 已登录则根据角色跳转
      if (userStore.role === 'administrator') {
        next('/admin/dashboard')
      } else {
        next('/officer/workspace')
      }
    } else {
      // 权限校验
      const requiredRoles = to.meta.roles
      if (requiredRoles && requiredRoles.length > 0) {
        if (requiredRoles.includes(userStore.role)) {
          next()
        } else {
          // 无权访问，跳转到403或对应角色的主页
          next({ path: '/login' }) // 简单处理：踢回登录页
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
      next('/login')
    }
  }
})