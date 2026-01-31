<template>
  <div class="admin-container">
    <el-container>
      <el-header class="admin-header">
        <div class="logo">需求管理后台</div>
        <div class="right-panel">
          <span>{{ userStore.name }}</span>
          <el-button type="danger" link @click="handleLogout">退出</el-button>
        </div>
      </el-header>
      
      <el-main>
        <el-card>
          <template #header>
            <div class="filter-header">
              <span>需求池 (主任务)</span>
              <el-button type="primary" @click="fetchData">刷新列表</el-button>
            </div>
          </template>

          <el-table :data="mainList" border style="width: 100%" v-loading="loading">
            <el-table-column prop="mainTaskId" label="ID" width="80" />
            <el-table-column prop="taskName" label="需求名称" min-width="200" />
            <el-table-column prop="teacher" label="提交教师" width="120" />
            <el-table-column prop="department" label="学院/部门" width="150" />
            <el-table-column label="截止时间" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.dateLimit) }}
              </template>
            </el-table-column>
            
            <el-table-column label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getMainStatusType(scope.row.tag)">
                  {{ getMainStatusLabel(scope.row.tag) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="200" fixed="right">
              <template #default="scope">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="goToDetail(scope.row.mainTaskId)"
                >
                  分配与详情
                </el-button>
                
                <el-button 
                  v-if="scope.row.tag === 0"
                  type="success" 
                  size="small" 
                  @click="handleStart(scope.row)"
                >
                  受理
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-block">
            <el-pagination
              v-model:current-page="page"
              v-model:page-size="pageSize"
              :total="total"
              layout="total, prev, pager, next"
              @current-change="fetchData"
            />
          </div>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../store/user'
import { getMainList, updateMainStatus } from '../../api/admin'
import { MAIN_TASK_STATUS } from '../../store/dict'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const mainList = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const getMainStatusLabel = (val) => MAIN_TASK_STATUS.find(i => i.value === val)?.label || '未知'
const getMainStatusType = (val) => MAIN_TASK_STATUS.find(i => i.value === val)?.type || ''
const formatDate = (str) => str ? str.replace('T', ' ') : '-'

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getMainList({ page: page.value, pageSize: pageSize.value })
    // 后端返回结构适配
    if (res && res.list) {
      mainList.value = res.list
      total.value = res.total
    } else if (Array.isArray(res)) {
      // 如果后端没做分页，直接返回数组
      mainList.value = res
      total.value = res.length
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => {
  router.push(`/admin/task/${id}`)
}

// 受理主任务
const handleStart = async (row) => {
  try {
    await updateMainStatus(row.mainTaskId, 1) // 1 = 进行中
    ElMessage.success('已受理，状态更新为进行中')
    fetchData()
  } catch (error) {
    console.error(error)
  }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.admin-header {
  background-color: #409EFF;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}
.logo { font-size: 18px; font-weight: bold; }
.right-panel { display: flex; align-items: center; gap: 15px; color: white; }
.pagination-block { margin-top: 20px; display: flex; justify-content: flex-end; }
.filter-header { display: flex; justify-content: space-between; align-items: center; }
</style>