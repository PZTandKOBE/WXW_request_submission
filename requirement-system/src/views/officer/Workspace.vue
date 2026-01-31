<template>
  <div class="workspace-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>我的工作台</span>
          <div class="user-info">
            <el-tag effect="dark" type="success">干事</el-tag>
            <span class="username">{{ userStore.name }}</span>
            <el-button type="danger" link @click="handleLogout">退出登录</el-button>
          </div>
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
            <el-button 
              v-if="scope.row.status === 0"
              type="primary" 
              size="small" 
              @click="handleAccept(scope.row)"
            >
              接单
            </el-button>

            <el-button 
              v-else-if="scope.row.status === 1"
              type="success" 
              size="small" 
              @click="openSubmitDialog(scope.row)"
            >
              提交成果
            </el-button>

            <el-button 
              v-else
              type="info" 
              size="small" 
              plain
              @click="viewDetails(scope.row)"
            >
              查看详情
            </el-button>
            
            <el-button type="text" size="small" @click="downloadTaskFile(scope.row)">
              下载附件
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="提交任务成果" width="30%">
      <el-form>
        <el-form-item label="成果附件">
          <el-upload
            ref="uploadRef"
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            :on-exceed="handleExceed"
          >
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">请上传 .zip 或 .doc 文档</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submitReply">
            确认提交
          </el-button>
        </span>
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

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const taskList = ref([])
const dialogVisible = ref(false)
const submitting = ref(false)
const currentTask = ref(null)
const selectedFile = ref(null)

// 字典工具方法
const getStatusLabel = (val) => SON_TASK_STATUS.find(i => i.value === val)?.label || '未知'
const getStatusType = (val) => SON_TASK_STATUS.find(i => i.value === val)?.type || ''
const formatDate = (str) => str ? str.replace('T', ' ') : '-'

// 获取任务列表
const fetchData = async () => {
  loading.value = true
  try {
    // 根据手册：传入 officerAddress (即姓名)
    const res = await getMyTasks(userStore.name)
    // 后端如果返回数组直接用，如果是 {data: []} 则取 data
    taskList.value = Array.isArray(res) ? res : (res.data || [])
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 1. 接单操作
const handleAccept = (row) => {
  ElMessageBox.confirm('确认受理该任务吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      // 状态变更: 0 -> 1 (进行中)
      await updateStatus(row.id, 1) // 注意：这里row.id需根据后端实际字段调整，可能是 breakdownId
      ElMessage.success('接单成功')
      fetchData() // 刷新列表
    } catch (error) {
      console.error(error)
    }
  })
}

// 2. 打开提交弹窗
const openSubmitDialog = (row) => {
  currentTask.value = row
  selectedFile.value = null
  dialogVisible.value = true
}

// 文件选择变动
const handleFileChange = (file) => {
  selectedFile.value = file.raw
}

const handleExceed = () => {
  ElMessage.warning('只能上传一个文件，请先删除旧文件')
}

// 3. 提交回复
const submitReply = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请选择要上传的文件')
    return
  }
  
  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('files', selectedFile.value)
    // 注意字段名：后端接口文档里是 breakdownId
    formData.append('breakdownId', currentTask.value.id) 

    await uploadReply(formData)
    
    // 提交成功后，通常需要把状态改为“已提交/待审核” (例如状态 2)
    // 如果后端 uploadReply 没有自动改状态，需要手动再调一次 updateStatus
    // 这里假设 uploadReply 只是传文件，还需要手动改状态
    // await updateStatus(currentTask.value.id, 2) 
    
    ElMessage.success('提交成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

// 下载任务附件（管理员发的）
const downloadTaskFile = (row) => {
  // 暂时仅作提示，需配合 File 接口实现下载逻辑
  ElMessage.info(`正在请求下载任务 ${row.taskName} 的附件...`)
}

// 退出
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.workspace-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.username {
  font-weight: bold;
}
</style>