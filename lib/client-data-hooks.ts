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