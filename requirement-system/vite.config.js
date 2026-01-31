import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      // 1. 业务接口 (保持不变)
      '/check': {
        target: 'http://117.72.16.195:6600',
        changeOrigin: true,
      },
      // 2. 登录接口 (保持不变)
      '/api-auth': {
        target: 'http://117.72.16.195:6600',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-auth/, '')
      },

      // 👇👇👇 重点修改这里！👇👇👇
      // 3. 权限/用户信息接口
      '/permission': {
        target: 'http://117.72.16.195:6600', // 目标就是你刚才测试通的地址
        changeOrigin: true,
        // ❌ 之前可能写了 rewrite 去掉前缀，现在千万别去掉！
        // 因为后端真实地址里就包含 /permission
        // 前端请求: /permission/user/information
        // 转发后: http://117.72.16.195:6600/permission/user/information (正是你要的地址)
      }
    }
  }
})