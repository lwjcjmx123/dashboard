'use client'

import { useState, useEffect, useCallback } from 'react'
import { getDataAdapter } from './data-adapter'
import { notificationService } from './notification-service'

// Client-side data hooks that use IndexedDB directly

export const useClientTasks = () => {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      const adapter = getDataAdapter()
      const result = await adapter.task.findMany()
      setTasks(result || [])
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Error loading tasks:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [])

  const createTask = useCallback(async (input: any) => {
    try {
      const adapter = getDataAdapter()
      const newTask = await adapter.task.create({
        data: {
          ...input,
          userId: 'demo-user-id',
          id: 'task_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: input.tags || [],
          subtasks: []
        }
      })
      await loadTasks() // Refresh the list
      return newTask
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [loadTasks])

  const updateTask = useCallback(async (input: any) => {
    try {
      const adapter = getDataAdapter()
      const { id, ...updateData } = input
      const updatedTask = await adapter.task.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date().toISOString()
        }
      })
      await loadTasks() // Refresh the list
      return updatedTask
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [loadTasks])

  const deleteTask = useCallback(async (id: string) => {
    try {
      const adapter = getDataAdapter()
      await adapter.task.delete({ where: { id } })
      await loadTasks() // Refresh the list
      return true
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [loadTasks])

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch: loadTasks
  }
}

export const useClientNotes = () => {
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true)
      const adapter = getDataAdapter()
      const result = await adapter.note.findMany()
      setNotes(result || [])
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Error loading notes:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotes()
  }, [])

  const createNote = useCallback(async (input: any) => {
    try {
      const adapter = getDataAdapter()
      const newNote = await adapter.note.create({
        data: {
          ...input,
          userId: 'demo-user-id',
          id: 'note_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: input.tags || []
        }
      })
      await loadNotes() // Refresh the list
      return newNote
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [loadNotes])

  const updateNote = useCallback(async (input: any) => {
    try {
      const adapter = getDataAdapter()
      const { id, ...updateData } = input
      const updatedNote = await adapter.note.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date().toISOString()
        }
      })
      await loadNotes() // Refresh the list
      return updatedNote
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [loadNotes])

  const deleteNote = useCallback(async (id: string) => {
    try {
      const adapter = getDataAdapter()
      await adapter.note.delete({ where: { id } })
      await loadNotes() // Refresh the list
      return true
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [loadNotes])

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    refetch: loadNotes
  }
}

export const useClientBills = () => {
  const [bills, setBills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadBills = useCallback(async () => {
    try {
      setLoading(true)
      const adapter = getDataAdapter()
      const result = await adapter.bill.findMany()
      setBills(result || [])
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Error loading bills:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBills()
  }, [])

  const createBill = useCallback(async (input: any) => {
    try {
      const adapter = getDataAdapter()
      const newBill = await adapter.bill.create({
        data: {
          ...input,
          userId: 'demo-user-id',
          id: 'bill_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })
      await loadBills() // Refresh the list
      return newBill
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [loadBills])

  const updateBill = useCallback(async (input: any) => {
    try {
      const adapter = getDataAdapter()
      const { id, ...updateData } = input
      const updatedBill = await adapter.bill.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date().toISOString()
        }
      })
      await loadBills() // Refresh the list
      return updatedBill
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [loadBills])

  const deleteBill = useCallback(async (id: string) => {
    try {
      const adapter = getDataAdapter()
      await adapter.bill.delete({ where: { id } })
      await loadBills() // Refresh the list
      return true
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [loadBills])

  return {
    bills,
    loading,
    error,
    createBill,
    updateBill,
    deleteBill,
    refetch: loadBills
  }
}

export const useClientExpenses = () => {
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true)
      const adapter = getDataAdapter()
      const result = await adapter.expense.findMany()
      setExpenses(result || [])
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Error loading expenses:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadExpenses()
  }, [])

  const createExpense = useCallback(async (input: any) => {
    try {
      const adapter = getDataAdapter()
      const newExpense = await adapter.expense.create({
        data: {
          ...input,
          userId: 'demo-user-id',
          id: 'expense_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: input.tags || []
        }
      })
      await loadExpenses() // Refresh the list
      return newExpense
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [loadExpenses])

  const deleteExpense = useCallback(async (id: string) => {
    try {
      const adapter = getDataAdapter()
      await adapter.expense.delete({ where: { id } })
      await loadExpenses() // Refresh the list
      return true
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [loadExpenses])

  return {
    expenses,
    loading,
    error,
    createExpense,
    deleteExpense,
    refetch: loadExpenses
  }
}

export const useClientEvents = () => {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true)
      const adapter = getDataAdapter()
      const result = await adapter.event.findMany()
      setEvents(result || [])
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Error loading events:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents()
  }, [])

  const createEvent = useCallback(async (input: any) => {
    try {
      const adapter = getDataAdapter()
      const newEvent = await adapter.event.create({
        data: {
          ...input,
          userId: 'demo-user-id',
          id: 'event_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })
      await loadEvents() // Refresh the list
      return newEvent
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [loadEvents])

  const updateEvent = useCallback(async (input: any) => {
    try {
      const adapter = getDataAdapter()
      const { id, ...updateData } = input
      const updatedEvent = await adapter.event.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date().toISOString()
        }
      })
      await loadEvents() // Refresh the list
      return updatedEvent
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [loadEvents])

  const deleteEvent = useCallback(async (id: string) => {
    try {
      const adapter = getDataAdapter()
      await adapter.event.delete({ where: { id } })
      await loadEvents() // Refresh the list
      return true
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [loadEvents])

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: loadEvents
  }
}

export const useClientNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [hideRead, setHideRead] = useState(true) // 默认隐藏已读通知

  const loadNotifications = useCallback(async (hideReadNotifications: boolean = hideRead) => {
    if (!isClient) return
    
    try {
      setLoading(true)
      
      // First, generate any new notifications
      await notificationService.triggerNotificationCheck('demo-user-id')
      
      // Then load notifications using the new service method
      const result = await notificationService.getNotifications('demo-user-id', hideReadNotifications)
      setNotifications(result || [])
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [isClient, hideRead])

  useEffect(() => {
    setIsClient(true)
  }, [])
  
  useEffect(() => {
    if (isClient) {
      loadNotifications()
    }
  }, [isClient, loadNotifications])

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markNotificationAsRead(id)
      await loadNotifications() // Refresh the list
      return true
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [loadNotifications])

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllNotificationsAsRead('demo-user-id')
      await loadNotifications() // Refresh the list
      return true
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [loadNotifications])

  const toggleHideRead = useCallback(async (hide: boolean) => {
    setHideRead(hide)
    await loadNotifications(hide)
  }, [loadNotifications])

  const createNotification = useCallback(async (input: any) => {
    try {
      const adapter = getDataAdapter()
      const newNotification = await adapter.notification.create({
        data: {
          ...input,
          userId: 'demo-user-id',
          id: 'notification_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
          read: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })
      await loadNotifications() // Refresh the list
      return newNotification
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [loadNotifications])

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationService.deleteNotification(id)
      await loadNotifications() // Refresh the list
      return true
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [loadNotifications])

  const deleteReadNotifications = useCallback(async () => {
    try {
      await notificationService.deleteReadNotifications('demo-user-id')
      await loadNotifications() // Refresh the list
      return true
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [loadNotifications])

  return {
    notifications,
    loading,
    error,
    hideRead,
    markAsRead,
    markAllAsRead,
    toggleHideRead,
    createNotification,
    deleteNotification,
    deleteReadNotifications,
    refetch: loadNotifications
  }
}

export const useClientPomodoroSessions = () => {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true)
      const adapter = getDataAdapter()
      const result = await adapter.pomodoroSession.findMany()
      setSessions(result || [])
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Error loading pomodoro sessions:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSessions()
  }, [])

  const createSession = useCallback(async (input: any) => {
    try {
      const adapter = getDataAdapter()
      const newSession = await adapter.pomodoroSession.create({
        data: {
          ...input,
          userId: 'demo-user-id',
          id: 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })
      await loadSessions() // Refresh the list
      return newSession
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [loadSessions])

  return {
    sessions,
    loading,
    error,
    createSession,
    refetch: loadSessions
  }
}

export const useClientUserSettings = () => {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      const adapter = getDataAdapter()
      let result = await adapter.userSettings.findUnique({
        where: { userId: 'demo-user-id' }
      })
      
      // If no settings found, create default settings
      if (!result) {
        const defaultSettings = {
          userId: 'demo-user-id',
          theme: 'light',
          colorScheme: 'blue',
          language: 'en',
          timeFormat: '24',
          currency: 'CNY',
          notifyTasks: true,
          notifyBills: true,
          notifyPomodoro: true,
          notifyEvents: true,
          workDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          sessionsUntilLongBreak: 4
        }
        result = await adapter.userSettings.upsert({
          where: { userId: 'demo-user-id' },
          update: defaultSettings,
          create: defaultSettings
        })
      }
      
      setSettings(result)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [])

  const updateSettings = useCallback(async (input: any) => {
    try {
      const adapter = getDataAdapter()
      const updatedSettings = await adapter.userSettings.upsert({
        where: { userId: 'demo-user-id' },
        update: {
          ...input,
          updatedAt: new Date().toISOString()
        },
        create: {
          ...input,
          userId: 'demo-user-id',
          id: 'settings_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })
      setSettings(updatedSettings)
      return updatedSettings
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: loadSettings
  }
}

// 数据导出功能 - 导出所有用户数据为JSON格式
export const exportAllData = async (): Promise<string> => {
  try {
    const adapter = getDataAdapter()
    
    // 获取所有数据表的数据
    const [tasks, notes, bills, expenses, events, pomodoroSessions, userSettings, notifications] = await Promise.all([
      adapter.task.findMany(),
      adapter.note.findMany(),
      adapter.bill.findMany(),
      adapter.expense.findMany(),
      adapter.event.findMany(),
      adapter.pomodoroSession.findMany(),
      adapter.userSettings.findUnique({ where: { userId: 'demo-user-id' } }),
      adapter.notification.findMany()
    ])

    // 构建导出数据结构
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        tasks: tasks || [],
        notes: notes || [],
        bills: bills || [],
        expenses: expenses || [],
        events: events || [],
        pomodoroSessions: pomodoroSessions || [],
        userSettings: userSettings || null,
        notifications: notifications || []
      }
    }

    return JSON.stringify(exportData, null, 2)
  } catch (error) {
    console.error('Error exporting data:', error)
    throw new Error('导出数据失败')
  }
}

// 数据导入功能 - 从JSON数据导入所有数据
export const importAllData = async (jsonData: string): Promise<void> => {
  try {
    const importData = JSON.parse(jsonData)
    
    // 验证数据格式
    if (!importData.data || typeof importData.data !== 'object') {
      throw new Error('无效的数据格式')
    }

    const adapter = getDataAdapter()
    const { data } = importData

    // 导入用户设置
    if (data.userSettings) {
      await adapter.userSettings.upsert({
        where: { userId: 'demo-user-id' },
        create: {
          ...data.userSettings,
          userId: 'demo-user-id',
          updatedAt: new Date().toISOString()
        },
        update: {
          ...data.userSettings,
          userId: 'demo-user-id',
          updatedAt: new Date().toISOString()
        }
      })
    }

    // 导入任务
    if (data.tasks && Array.isArray(data.tasks)) {
      for (const task of data.tasks) {
        await adapter.task.create({
          data: {
            ...task,
            id: task.id || 'task_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
            userId: 'demo-user-id',
            updatedAt: new Date().toISOString()
          }
        })
      }
    }

    // 导入笔记
    if (data.notes && Array.isArray(data.notes)) {
      for (const note of data.notes) {
        await adapter.note.create({
          data: {
            ...note,
            id: note.id || 'note_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
            userId: 'demo-user-id',
            updatedAt: new Date().toISOString()
          }
        })
      }
    }

    // 导入账单
    if (data.bills && Array.isArray(data.bills)) {
      for (const bill of data.bills) {
        await adapter.bill.create({
          data: {
            ...bill,
            id: bill.id || 'bill_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
            userId: 'demo-user-id',
            updatedAt: new Date().toISOString()
          }
        })
      }
    }

    // 导入支出
    if (data.expenses && Array.isArray(data.expenses)) {
      for (const expense of data.expenses) {
        await adapter.expense.create({
          data: {
            ...expense,
            id: expense.id || 'expense_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
            userId: 'demo-user-id',
            updatedAt: new Date().toISOString()
          }
        })
      }
    }

    // 导入事件
    if (data.events && Array.isArray(data.events)) {
      for (const event of data.events) {
        await adapter.event.create({
          data: {
            ...event,
            id: event.id || 'event_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
            userId: 'demo-user-id',
            updatedAt: new Date().toISOString()
          }
        })
      }
    }

    // 导入番茄钟会话
    if (data.pomodoroSessions && Array.isArray(data.pomodoroSessions)) {
      for (const session of data.pomodoroSessions) {
        await adapter.pomodoroSession.create({
          data: {
            ...session,
            id: session.id || 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
            userId: 'demo-user-id'
          }
        })
      }
    }

    // 导入通知
    if (data.notifications && Array.isArray(data.notifications)) {
      for (const notification of data.notifications) {
        await adapter.notification.create({
          data: {
            ...notification,
            id: notification.id || 'notification_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
            userId: 'demo-user-id',
            updatedAt: new Date().toISOString()
          }
        })
      }
    }

  } catch (error) {
    console.error('Error importing data:', error)
    if (error instanceof SyntaxError) {
      throw new Error('无效的JSON格式')
    }
    throw new Error('导入数据失败')
  }
}

// 清除所有数据功能
export const clearAllData = async (): Promise<void> => {
  try {
    const adapter = getDataAdapter()
    
    // 获取所有数据并删除
    const [tasks, notes, bills, expenses, events, notifications] = await Promise.all([
      adapter.task.findMany(),
      adapter.note.findMany(),
      adapter.bill.findMany(),
      adapter.expense.findMany(),
      adapter.event.findMany(),
      adapter.notification.findMany()
    ])

    // 删除所有任务
    for (const task of tasks || []) {
      await adapter.task.delete({ where: { id: task.id } })
    }

    // 删除所有笔记
    for (const note of notes || []) {
      await adapter.note.delete({ where: { id: note.id } })
    }

    // 删除所有账单
    for (const bill of bills || []) {
      await adapter.bill.delete({ where: { id: bill.id } })
    }

    // 删除所有支出
    for (const expense of expenses || []) {
      await adapter.expense.delete({ where: { id: expense.id } })
    }

    // 删除所有事件
    for (const event of events || []) {
      await adapter.event.delete({ where: { id: event.id } })
    }

    // 删除所有通知
    for (const notification of notifications || []) {
      await adapter.notification.delete({ where: { id: notification.id } })
    }

    // 重置用户设置为默认值
    await adapter.userSettings.upsert({
      where: { userId: 'demo-user-id' },
      create: {
        userId: 'demo-user-id',
        theme: 'light',
        language: 'en',
        timeFormat: '24',
        currency: 'USD',
        notifyTasks: true,
        notifyBills: true,
        notifyPomodoro: true,
        notifyEvents: true,
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsUntilLongBreak: 4,
        id: 'settings_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      update: {
        theme: 'light',
        language: 'en',
        timeFormat: '24',
        currency: 'USD',
        notifyTasks: true,
        notifyBills: true,
        notifyPomodoro: true,
        notifyEvents: true,
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsUntilLongBreak: 4,
        updatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error clearing data:', error)
    throw new Error('清除数据失败')
  }
}