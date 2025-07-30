export const formatNotificationTime = (createdAt: string): string => {
  const now = new Date()
  const notificationTime = new Date(createdAt)
  const diffInMs = now.getTime() - notificationTime.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) {
    return '刚刚'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`
  } else if (diffInHours < 24) {
    return `${diffInHours}小时前`
  } else if (diffInDays < 7) {
    return `${diffInDays}天前`
  } else {
    return notificationTime.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }
}

export const getNotificationView = (notification: any): string => {
  switch (notification.type) {
    case 'TASK_DUE':
    case 'TASK_OVERDUE':
      return 'tasks'
    case 'BILL_DUE':
    case 'BILL_OVERDUE':
      return 'finance'
    case 'EVENT_REMINDER':
      return 'calendar'
    case 'POMODORO_COMPLETE':
    case 'POMODORO_BREAK':
      return 'pomodoro'
    default:
      return 'dashboard'
  }
}