'use client'

import React from 'react'
import { 
  Home, 
  Calendar, 
  CheckSquare, 
  DollarSign, 
  FileText, 
  Timer, 
  BarChart3, 
  Settings,
  Moon,
  Sun
} from 'lucide-react'
import { useMutation } from '@apollo/client'
import { UPDATE_USER_SETTINGS } from '@/lib/graphql/mutations'
import { GET_ME } from '@/lib/graphql/queries'

type ViewType = 'dashboard' | 'calendar' | 'tasks' | 'finance' | 'notes' | 'pomodoro' | 'analytics' | 'settings'

interface SidebarProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const [updateSettings] = useMutation(UPDATE_USER_SETTINGS, {
    refetchQueries: [{ query: GET_ME }],
  })

  const toggleTheme = async () => {
    const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark'
    
    try {
      await updateSettings({
        variables: {
          input: { theme: newTheme }
        }
      })
      
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
    } catch (error) {
      console.error('Failed to update theme:', error)
    }
  }

  const isDark = document.documentElement.classList.contains('dark')

  return (
    <div className={`h-full flex flex-col ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} border-r border-gray-200 dark:border-gray-700 transition-colors duration-200`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          PMS
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Personal Management System
        </p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewType)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
          <span className="font-medium">
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar