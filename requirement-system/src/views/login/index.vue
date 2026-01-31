<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="/wxw.png" alt="Logo" class="logo" />
        <h2>需求提交系统</h2>
        <p class="subtitle">网站运维部 · 统一身份认证</p>
      </div>

      <div class="login-body">
        <div v-if="loading" class="loading-state">
          <el-icon class="is-loading" :size="40" color="#409eff"><Loading /></el-icon>
          <p>正在验证身份并同步数据...</p>
        </div>

        <div v-else class="action-state">
          <div class="tips">
            <el-alert
              title="本系统仅支持学校统一身份认证登录"
              type="info"
              show-icon
              :closable="false"
            />
          </div>
          <el-button 
            type="primary" 
            size="large" 
            class="login-btn" 
            @click="handleAuthJump"
          >
            前往统一认证平台登录
          </el-button>
        </div>
      </div>

      <div class="login-footer">
        <p>&copy; {{ new Date().getFullYear() }} 广州城市理工学院 网站运维部</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../../store/user'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const isLoginStarted = ref(false)

// 1. 跳转到学校认证平台
const handleAuthJump = () => {
  const authUrl = import.meta.env.VITE_AUTH_URL
  const clientId = import.meta.env.VITE_CLIENT_ID
  const callbackUrl = import.meta.env.VITE_CALLBACK_URL

  if (!authUrl || !clientId) {
    ElMessage.error('环境配置缺失')
    return
  }
  const targetUrl = `${authUrl}?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(callbackUrl)}`
  window.location.href = targetUrl
}

// 2. 处理登录回调
const handleLogin = async (code) => {
  if (isLoginStarted.value) return
  isLoginStarted.value = true
  
  loading.value = true
  try {
    // 调用 Store 的 login (内部会自动处理 token -> userInfo -> roleId映射)
    await userStore.login(code)
    
    ElMessage.success(`欢迎回来，${userStore.name}`)

    // 3. 根据映射好的角色跳转
    if (userStore.role === 'administrator') {
      router.push('/admin/dashboard')
    } else if (userStore.role === 'officer') {
      router.push('/officer/workspace')
    } else {
      ElMessage.warning(`您的账号角色ID(${userStore.roleId}) 无权访问本系统`)
      loading.value = false
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error(error.message || '登录失败，请重试')
    loading.value = false
    // 失败后建议去掉URL参数，防止刷新死循环
    router.replace('/login')
  }
}

onMounted(() => {
  const code = route.query.code
  if (code) {
    handleLogin(code)
  }
})
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
  background-image: radial-gradient(#e3e3e3 1px, transparent 1px);
  background-size: 20px 20px;

  .login-box {
    width: 420px;
    padding: 40px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    text-align: center;

    .login-header {
      margin-bottom: 40px;
      .logo { height: 60px; margin-bottom: 16px; }
      h2 { margin: 0; font-size: 24px; color: #303133; font-weight: 600; }
      .subtitle { margin-top: 8px; color: #909399; font-size: 14px; }
    }

    .login-body {
      min-height: 150px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      .loading-state { display: flex; flex-direction: column; align-items: center; gap: 16px; color: #409eff; }
      .action-state {
        .tips { margin-bottom: 24px; text-align: left; }
        .login-btn { width: 100%; font-weight: 500; height: 48px; font-size: 16px; }
      }
    }
    .login-footer { margin-top: 40px; color: #c0c4cc; font-size: 12px; }
  }
}
</style>