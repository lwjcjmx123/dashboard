'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useClientUserSettings } from '@/lib/client-data-hooks'
import Sidebar from './Sidebar'
import Header from './Header'

type ViewType = 'dashboard' | 'calendar' | 'tasks' | 'finance' | 'notes' | 'pomodoro' | 'analytics' | 'settings'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isDark, setIsDark] = useState(false)

  const { settings: userSettings, loading, error } = useClientUserSettings()

  // 从路径获取当前视图
  const getCurrentView = (): ViewType => {
    const path = pathname.slice(1) // 移除开头的 '/'
    if (!path || path === '' || path === 'dashboard') return 'dashboard'
    return path as ViewType
  }

  const currentView = getCurrentView()

  const handleViewChange = (view: string) => {
    // 这个函数现在由路由处理，保留以兼容Header组件
  }

  useEffect(() => {
    if (userSettings?.theme) {
      const theme = userSettings.theme
      setIsDark(theme === 'dark')
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
  }, [userSettings])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex h-screen ${isDark ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Sidebar currentView={currentView} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header selectedDate={selectedDate} onViewChange={handleViewChange} />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  )
}