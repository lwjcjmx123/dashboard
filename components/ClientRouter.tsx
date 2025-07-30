'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AppLayout from '@/components/Layout/AppLayout'
import Dashboard from '@/components/Dashboard/Dashboard'
import Tasks from '@/components/Tasks/Tasks'
import Pomodoro from '@/components/Pomodoro/Pomodoro'
import Calendar from '@/components/Calendar/Calendar'
import Analytics from '@/components/Analytics/Analytics'
import Finance from '@/components/Finance/Finance'
import Notes from '@/components/Notes/Notes'
import Settings from '@/components/Settings/Settings'

/**
 * 客户端路由组件，预加载所有页面组件以提高切换性能
 * 避免路由切换时的卡顿和重新渲染
 * 使用 Next.js 路由系统进行导航
 */
export default function ClientRouter() {
  const router = useRouter()
  const pathname = usePathname()
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  // 从路径获取当前视图
  const getCurrentView = () => {
    const path = pathname.replace('/', '') || 'dashboard'
    return path === '' ? 'dashboard' : path
  }
  
  const currentView = getCurrentView()

  /**
   * 处理页面导航
   */
  const handleNavigate = (view: string) => {
    const path = view === 'dashboard' ? '/' : `/${view}`
    router.push(path)
  }

  /**
   * 处理日期选择
   */
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  /**
   * 渲染当前激活的组件
   */
  const renderActiveComponent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />
      case 'tasks':
        return <Tasks />
      case 'pomodoro':
        return <Pomodoro />
      case 'calendar':
        return <Calendar selectedDate={selectedDate} onDateSelect={handleDateSelect} />
      case 'analytics':
        return <Analytics />
      case 'finance':
        return <Finance />
      case 'notes':
        return <Notes />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard onNavigate={handleNavigate} />
    }
  }

  return (
    <AppLayout>
      {renderActiveComponent()}
    </AppLayout>
  )
}