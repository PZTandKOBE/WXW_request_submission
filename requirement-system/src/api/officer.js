import request from '../utils/request'

// 获取我的任务
export function getMyTasks(officerAddress) {
  return request({
    url: '/api/officer/get/myTasks',
    method: 'get',
    params: { officerAddress } // 传姓名
  })
}

// 修改任务状态 (接单/提交)
export function updateStatus(breakdownId, status) {
  return request({
    url: '/api/officer/post/sonStatus',
    method: 'post',
    params: { breakdownId, status }
  })
}

// 上传回复附件
// 注意：文档显示这是 multipart/form-data
export function uploadReply(data) {
  return request({
    url: '/api/officer/add/Annexs',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data // FormData 对象
  })
}

// 获取任务附件 (管理员派发的)
export function getTaskFiles(breakdownId) {
  return request({
    // 注意：文档中这里的URL有一个拼写错误 /checkl/，这里我先修正为 /check/
    // 如果后端未改，请保留 /checkl/
    url: '/api/officer/get/AnnexList', 
    method: 'get',
    params: { breakdownId }
  })
}

// 查看自己提交的附件
export function getReplyFiles(breakdownId) {
  return request({
    url: '/api/officer/get/ReplyAnnexList',
    method: 'get',
    params: { breakdownId }
  })
}