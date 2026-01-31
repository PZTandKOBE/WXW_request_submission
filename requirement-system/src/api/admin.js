import request from '../utils/request'

// 获取需求池 (主任务列表)
export function getMainList(params) {
  return request({
    url: '/api/administrator/get/allMain',
    method: 'get',
    params // 包含 page, pageSize
  })
}

// 修复：新增根据名称搜索主任务的接口
export function getMainTaskByName(mainTaskName) {
  return request({
    url: '/api/administrator/get/mainTaskByName',
    method: 'get',
    params: { mainTaskName }
  })
}

// 获取主任务详情
export function getMainDetail(mainTaskId) {
  return request({
    url: '/api/administrator/get/mainRequirement',
    method: 'get',
    params: { mainTaskId }
  })
}

// 修改主任务状态
export function updateMainStatus(mainTaskId, status) {
  return request({
    url: '/api/administrator/update/mainStatus',
    method: 'post',
    params: { mainTaskId, status }
  })
}

// 获取所有干事 (用于下拉筛选或分配任务)
export function getAllOfficers(departmentId) {
  return request({
    url: '/api/administrator/get/allUser',
    method: 'get',
    params: { departmentId }
  })
}

// 根据干事姓名查询主任务
export function getMainTaskByOfficial(Official) {
  return request({
    url: '/api/administrator/get/mainTaskByOfficial',
    method: 'get',
    params: { Official }
  })
}

// 发布(分配)子任务
export function createSonTask(data) {
  return request({
    url: '/api/administrator/post/sonTask',
    method: 'post',
    data // body json
  })
}

// 获取某主任务下的所有子任务
export function getSonTaskList(mainTaskId) {
  return request({
    url: '/api/administrator/get/allSonTask',
    method: 'get',
    params: { mainTaskId }
  })
}

// 审核子任务状态 (通过/驳回)
export function auditSonTask(sonTaskId, status) {
  return request({
    url: '/api/administrator/update/sonStatus',
    method: 'post',
    params: { sonTaskId, status }
  })
}

// 获取主任务附件列表
export function getMainFiles(requirementId) {
  return request({
    url: '/api/administrator/get/MainAnnexList',
    method: 'get',
    params: { requirementId }
  })
}