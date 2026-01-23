import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue')
  },
  {
    path: '/admin',
    component: () => import('../views/admin/Dashboard.vue'), // 暂时指向Dashboard
    meta: { roles: ['administrator'] },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue')
      },
      {
        path: 'task/:id',
        name: 'TaskDetail',
        component: () => import('../views/admin/TaskDetail.vue')
      }
    ]
  },
  {
    path: '/officer',
    component: () => import('../views/officer/Workspace.vue'), // 暂时指向Workspace
    meta: { roles: ['officer'] },
    children: [
      {
        path: 'workspace',
        name: 'OfficerWorkspace',
        component: () => import('../views/officer/Workspace.vue')
      }
    ]
  },
  {
    path: '/',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router