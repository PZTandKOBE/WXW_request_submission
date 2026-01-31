<template>
  <div class="common-layout">
    <el-container>
      <el-header class="custom-header">
        <img src="http://43.139.169.119:3640/assets/wxw-B19cp2E8.png" alt="logo" class="header-logo">
        <p class="header-title">学生网络与信息工作委员会需求处理管理系统</p>
        <div class="header-user">
          <el-tag type="info" effect="plain" style="margin-right: 10px">{{ userStore.roleId === '1' ? '管理员' : '干事' }}</el-tag>
          <span>{{ userStore.name }}</span>
          <el-button type="danger" link @click="handleLogout">退出</el-button>
        </div>
      </el-header>

      <el-container class="main-container">
        <el-aside width="200px">
          <el-menu default-active="1" class="el-menu-vertical-demo" :router="true">
            <el-menu-item index="1" route="/admin/dashboard">
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
          <el-card shadow="never">
            <template #header>
              <div class="filter-bar">
                <div class="left-filters">
                  <span class="filter-label">受理干事 </span>
                  <el-select
                    v-model="filterOfficer"
                    placeholder="请选择受理干事"
                    clearable
                    style="width: 200px; margin-right: 20px"
                  >
                    <el-option
                      v-for="item in officerOptions"
                      :key="item.id"
                      :label="item.username"
                      :value="item.username"
                    />
                  </el-select>

                  <el-input
                    v-model="searchKeyword"
                    placeholder="请输入任务名称"
                    clearable
                    style="width: 250px; margin-right: 10px"
                    @keyup.enter="handleSearch"
                  />
                  
                  <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
                  <el-button @click="resetFilters">重置</el-button>
                </div>
              </div>
            </template>

            <el-table 
              :data="mainList" 
              style="width: 100%; margin-top: 10px;" 
              v-loading="loading"
              border
            >
              <template #empty>
                <el-empty description="暂无相关任务数据" />
              </template>

              <el-table-column prop="mainTaskID" label="ID" width="100" />
              
              <el-table-column prop="taskName" label="任务名称" min-width="250" show-overflow-tooltip />
              <el-table-column prop="teacher" label="委托老师" width="150" />
              
              <el-table-column label="截止时间" width="200">
                <template #default="scope">
                  {{ formatDate(scope.row.dateLimit) }}
                </template>
              </el-table-column>

              <el-table-column label="状态" width="120">
                <template #default="scope">
                  <el-tag :type="getMainStatusType(scope.row.tag)">
                    {{ getMainStatusLabel(scope.row.tag) }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="操作" width="120" fixed="right">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="goToDetail(scope.row.mainTaskID)">
                    任务详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-block">
              <el-pagination
                v-model:current-page="page"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50]"
                :total="total"
                background
                layout="total, sizes, prev, pager, next, jumper"
                @current-change="fetchData"
                @size-change="handleSizeChange"
              />
            </div>
          </el-card>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../store/user'
import { 
  getMainList, 
  getAllOfficers, 
  getMainTaskByName, 
  getMainTaskByOfficial 
} from '../../api/admin' 
import { MAIN_TASK_STATUS } from '../../store/dict'
import { Search, ChatDotSquare, Menu as IconMenu } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const mainList = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const filterOfficer = ref('')
const searchKeyword = ref('')
const officerOptions = ref([])

// 字典映射
const getMainStatusLabel = (val) => MAIN_TASK_STATUS.find(i => i.value === Number(val))?.label || '未知'
const getMainStatusType = (val) => MAIN_TASK_STATUS.find(i => i.value === Number(val))?.type || 'info'
const formatDate = (str) => str ? str.replace('T', ' ').split('.')[0] : '-'

// 1. 获取干事列表
const fetchOfficers = async () => {
  const deptId = userStore.departmentId || 2
  try {
    const res = await getAllOfficers(deptId)
    // 适配逻辑：如果 res.data 是数组，直接用；如果是 res 直接是数组，也行
    const data = res.data || res
    officerOptions.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('获取干事失败:', error)
  }
}

// 2. 核心查询逻辑 (适配 { code: 200, data: [...] } 结构)
const fetchData = async () => {
  loading.value = true
  try {
    let res;
    
    // 选择接口
    if (filterOfficer.value) {
      res = await getMainTaskByOfficial(filterOfficer.value)
    } else if (searchKeyword.value) {
      res = await getMainTaskByName(searchKeyword.value)
    } else {
      res = await getMainList({
        page: page.value,
        pageSize: pageSize.value
      })
    }

    // --- 核心解析逻辑 ---
    // 假设 res 是 { code: 200, msg: "...", data: [...] }
    const responseData = res.data || res

    if (Array.isArray(responseData)) {
      // 这里的 data 直接就是任务列表数组
      mainList.value = responseData
      // 因为后端没返回 total 字段，暂时用数组长度作为总数
      // 如果后端分页是真实的（不仅返回当前页数据），那么 total 可能在别的地方或者就是 length
      total.value = responseData.length 
    } else if (responseData && Array.isArray(responseData.list)) {
      // 兼容旧逻辑
      mainList.value = responseData.list
      total.value = responseData.total || 0
    } else {
      // 兜底
      mainList.value = []
      total.value = 0
    }

  } catch (error) {
    console.error('获取数据出错:', error)
    ElMessage.error('获取任务列表失败')
    mainList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  fetchData()
}

const resetFilters = () => {
  filterOfficer.value = ''
  searchKeyword.value = ''
  handleSearch()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  fetchData()
}

const goToDetail = (id) => {
  router.push(`/admin/task/${id}`)
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

onMounted(() => {
  fetchData()
  fetchOfficers()
})
</script>

<style scoped>
.custom-header {
  background-color: rgb(43, 43, 43);
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
  gap: 15px;
}

.main-container {
  height: calc(100vh - 60px);
}

.el-aside {
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
}

.content-main {
  background-color: rgba(240, 248, 255);
  padding: 20px;
}

.filter-bar {
  display: flex;
  align-items: center;
}

.filter-label {
  font-weight: bold;
  font-size: 14px;
  margin-right: 8px;
}

.pagination-block {
  margin-top: 25px;
  display: flex;
  justify-content: center;
}

:deep(.el-table),
:deep(.el-table tr) {
  background-color: #fff;
}
</style>