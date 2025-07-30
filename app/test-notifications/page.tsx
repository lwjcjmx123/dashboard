'use client'

import React, { useState, useEffect } from 'react'
import { useClientNotifications } from '@/lib/client-data-hooks'
import { notificationService } from '@/lib/notification-service'
import { getDataAdapter } from '@/lib/data-adapter'

export default function TestNotifications() {
  const [logs, setLogs] = useState<string[]>([])
  const [adapterInfo, setAdapterInfo] = useState<string>('加载中...')
  const [isClient, setIsClient] = useState(false)
  const { notifications, loading, error } = useClientNotifications()

  const addLog = (message: string) => {
    if (!isClient) return // 避免在服务端添加日志
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  useEffect(() => {
    setIsClient(true)
    // 检查数据适配器类型
    const adapter = getDataAdapter()
    setAdapterInfo(adapter.constructor.name)
    addLog(`数据适配器类型: ${adapter.constructor.name}`)
  }, [])

  const testNotificationGeneration = async () => {
    addLog('开始测试通知生成...')
    try {
      await notificationService.triggerNotificationCheck('test-user')
      addLog('通知检查完成')
    } catch (error) {
      addLog(`通知检查错误: ${error}`)
    }
  }

  const verifyDatabase = async () => {
    addLog('🗄️ 验证 IndexedDB...')
    try {
      const adapter = getDataAdapter()
      if (adapter && typeof (adapter as any).verifyDatabase === 'function') {
        await (adapter as any).verifyDatabase()
        addLog('✅ 数据库验证完成')
      } else {
        addLog('⚠️ 数据库验证不可用 (服务端适配器)')
      }
    } catch (error) {
      addLog(`❌ 数据库验证失败: ${error}`)
    }
  }

  const clearDatabase = async () => {
    addLog('🗑️ 清除 IndexedDB...')
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const deleteRequest = indexedDB.deleteDatabase('dashboard-app')
        deleteRequest.onsuccess = () => {
          addLog('✅ 数据库清除成功')
          window.location.reload()
        }
        deleteRequest.onerror = () => {
          addLog('❌ 数据库清除失败')
        }
      } else {
        addLog('⚠️ IndexedDB 不可用')
      }
    } catch (error) {
      addLog(`❌ 清除数据库错误: ${error}`)
    }
  }

  const testDataAdapter = async () => {
    addLog('测试数据适配器...')
    try {
      const adapter = getDataAdapter()
      addLog(`适配器类型: ${adapter.constructor.name}`)
      
      // 测试任务查询
      const tasks = await adapter.task.findMany()
      addLog(`任务数量: ${tasks?.length || 0}`)
      
      // 测试账单查询
      const bills = await adapter.bill.findMany()
      addLog(`账单数量: ${bills?.length || 0}`)
      
      // 测试通知查询
      const notifications = await adapter.notification.findMany()
      addLog(`通知数量: ${notifications?.length || 0}`)
    } catch (error) {
      addLog(`数据适配器测试错误: ${error}`)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">通知系统测试页面</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 控制面板 */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">控制面板</h2>
            <div className="space-y-2">
              <button
                onClick={testNotificationGeneration}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                测试通知生成
              </button>
              <button
                onClick={testDataAdapter}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                测试数据适配器
              </button>
              <button
                onClick={verifyDatabase}
                className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                验证数据库
              </button>
              <button
                onClick={clearDatabase}
                className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                清除数据库
              </button>
              <button
                onClick={clearLogs}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                清除日志
              </button>
            </div>
          </div>
          
          {/* 系统信息 */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">系统信息</h2>
            <div className="space-y-2 text-sm">
              <div>数据适配器: {adapterInfo}</div>
              <div>通知加载状态: {loading ? '加载中' : '已完成'}</div>
              <div>通知数量: {notifications.length}</div>
              {error && <div className="text-red-500">错误: {error.message}</div>}
            </div>
          </div>
        </div>
        
        {/* 日志面板 */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">调试日志</h2>
          <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500">暂无日志...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* 通知列表 */}
      <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">当前通知</h2>
        {notifications.length === 0 ? (
          <div className="text-gray-500">暂无通知</div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="font-medium">{notification.title}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(notification.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}