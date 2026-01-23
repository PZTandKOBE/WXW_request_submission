import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      // 捕获所有 /check 开头的请求，转发到后端 8080 端口
      '/check': {
        target: 'http://localhost:8080', 
        changeOrigin: true,
        // 根据手册，后端真实路径包含 /check，所以这里不需要 rewrite 去掉它
      }
    }
  }
})