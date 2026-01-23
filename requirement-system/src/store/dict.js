// 主任务状态 (老师/管理员可见)
export const MAIN_TASK_STATUS = [
  { value: 0, label: '待受理', type: 'info' },
  { value: 1, label: '进行中', type: 'primary' },
  { value: 2, label: '已完成', type: 'success' }
]

// 子任务状态 (干事/管理员可见)
export const SON_TASK_STATUS = [
  { value: 0, label: '进行中', type: 'warning' },
  { value: 1, label: '待审核', type: 'primary' },  
  { value: 2, label: '已完成', type: 'success' }, // 审核通过
  { value: 3, label: '被打回', type: 'danger' }
]