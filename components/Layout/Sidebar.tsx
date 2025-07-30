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
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'
import { TranslationKey } from '@/lib/i18n'

type ViewType = 'dashboard' | 'calendar' | 'tasks' | 'finance' | 'notes' | 'pomodoro' | 'analytics' | 'settings'

interface SidebarProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

const getNavigationItems = (t: (key: TranslationKey) => string) => [
  { id: 'dashboard', label: t('dashboard'), icon: Home },
  { id: 'calendar', label: t('calendar'), icon: Calendar },
  { id: 'tasks', label: t('tasks'), icon: CheckSquare },
  { id: 'finance', label: t('finance'), icon: DollarSign },
  { id: 'notes', label: t('notes'), icon: FileText },
  { id: 'pomodoro', label: t('pomodoro'), icon: Timer },
  { id: 'analytics', label: t('analytics'), icon: BarChart3 },
  { id: 'settings', label: t('settings'), icon: Settings },
]

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const { t } = useLanguage()
  const { theme, setTheme } = useTheme()
  
  const navigationItems = getNavigationItems(t)

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const isDark = theme === 'dark'

  return (
    <div className={`h-full flex flex-col ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} border-r border-gray-200 dark:border-gray-700 transition-colors duration-200`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          PMS
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {t('personalManagementSystem')}
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
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
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
            {isDark ? t('lightMode') : t('darkMode')}
          </span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar