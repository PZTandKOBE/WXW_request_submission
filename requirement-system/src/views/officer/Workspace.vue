<template>
  <div class="common-layout">
    <el-container>
      <el-header class="custom-header">
        <img src="/wxw.png" alt="logo" class="header-logo">
        <p class="header-title">学生网络与信息工作委员会需求处理干事系统</p>
        <div class="header-user">
          <el-tag effect="plain" type="success" size="small">干事</el-tag>
          <span class="username">{{ userStore.name }}</span>
          <el-button type="danger" link @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>

      <el-container class="main-container">
        <el-aside width="200px">
          <el-menu 
            default-active="1" 
            class="el-menu-vertical-demo"
          >
            <el-menu-item index="1">
              <el-icon><ChatDotSquare /></el-icon>
              <span>任务列表</span>
            </el-menu-item>
            <el-menu-item index="2">
              <el-icon><icon-menu /></el-icon>
              <span>使用说明</span>
            </el-menu-item>
          </el-menu>
        </el-aside>

        <el-main class="content-main">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>我的工作台</span>
              </div>
            </template>

            <el-table :data="taskList" stripe style="width: 100%" v-loading="loading">
              <el-table-column prop="taskName" label="任务名称" width="180" />
              <el-table-column prop="mainTaskId" label="主任务ID" width="100" />
              <el-table-column label="截止时间" width="180">
                <template #default="scope">
                  {{ formatDate(scope.row.deadline) }}
                </template>
              </el-table-column>
              <el-table-column label="状态" width="120">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">
                    {{ getStatusLabel(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" min-width="200">
                <template #default="scope">
                  <el-button v-if="scope.row.status === 0" type="primary" size="small" @click="handleAccept(scope.row)">接单</el-button>
                  <el-button v-else-if="scope.row.status === 1" type="success" size="small" @click="openSubmitDialog(scope.row)">提交成果</el-button>
                  <el-button v-else type="info" size="small" plain @click="viewDetails(scope.row)">查看详情</el-button>
                  <el-button type="text" size="small" @click="downloadTaskFile(scope.row)">下载附件</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-main>
      </el-container>
    </el-container>

    <el-dialog v-model="dialogVisible" title="提交任务成果" width="30%">
      <el-form>
        <el-form-item label="成果附件">
          <el-upload
            ref="uploadRef"
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
          >
            <template #trigger><el-button type="primary">选择文件</el-button></template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitReply">确认提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../store/user'
import { getMyTasks, updateStatus, uploadReply } from '../../api/officer'
import { SON_TASK_STATUS } from '../../store/dict'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ChatDotSquare, Menu as IconMenu } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const taskList = ref([])
const dialogVisible = ref(false)
const submitting = ref(false)
const currentTask = ref(null)
const selectedFile = ref(null)

const getStatusLabel = (val) => SON_TASK_STATUS.find(i => i.value === val)?.label || '未知'
const getStatusType = (val) => SON_TASK_STATUS.find(i => i.value === val)?.type || ''
const formatDate = (str) => str ? str.replace('T', ' ') : '-'

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getMyTasks(userStore.name)
    taskList.value = Array.isArray(res) ? res : (res.data || [])
  } catch (error) { console.error(error) }
  finally { loading.value = false }
}

const handleAccept = (row) => {
  ElMessageBox.confirm('确认受理该任务吗？', '提示', { type: 'warning' }).then(async () => {
    try {
      await updateStatus(row.id, 1)
      ElMessage.success('接单成功')
      fetchData()
    } catch (error) { console.error(error) }
  })
}

const openSubmitDialog = (row) => {
  currentTask.value = row
  selectedFile.value = null
  dialogVisible.value = true
}

const handleFileChange = (file) => { selectedFile.value = file.raw }

const submitReply = async () => {
  if (!selectedFile.value) return ElMessage.warning('请选择文件')
  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('files', selectedFile.value)
    formData.append('breakdownId', currentTask.value.id)
    await uploadReply(formData)
    ElMessage.success('提交成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) { console.error(error) }
  finally { submitting.value = false }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

onMounted(() => { fetchData() })
</script>

<style scoped>
/* 复刻旧版顶部样式 */
.custom-header {
  background-color: rgb(43, 43, 43); /* 旧版背景色 */
  height: 60px !important;
  display: flex;
  align-items: center;
  padding: 0 20px;
  color: white;
}

.header-logo {
  width: 50px;
  height: 50px;
}

.header-title {
  margin-left: 15px;
  font-size: 15px;
  flex: 1;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  font-size: 14px;
}

/* 布局控制 */
.main-container {
  height: calc(100vh - 60px);
}

.el-aside {
  border-right: 1px solid #dcdfe6;
  background-color: #fff;
}

.el-menu {
  border-right: none;
}

.content-main {
  background-color: rgba(240, 248, 255); /* 旧版 content 背景色 */
  padding: 20px;
}

.card-header {
  font-weight: bold;
}
</style>