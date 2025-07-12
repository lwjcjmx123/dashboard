'use client'

import React from 'react'
import { useQuery } from '@apollo/client'
import { CheckSquare, DollarSign, FileText, Timer, TrendingUp, Calendar, AlertCircle } from 'lucide-react'
import { GET_TASKS, GET_BILLS, GET_NOTES, GET_POMODORO_SESSIONS } from '@/lib/graphql/queries'

interface DashboardProps {
  onNavigate: (view: string) => void
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { data: tasksData } = useQuery(GET_TASKS)
  const { data: billsData } = useQuery(GET_BILLS)
  const { data: notesData } = useQuery(GET_NOTES)
  const { data: pomodoroData } = useQuery(GET_POMODORO_SESSIONS)

  const tasks = tasksData?.tasks || []
  const bills = billsData?.bills || []
  const notes = notesData?.notes || []
  const pomodoroSessions = pomodoroData?.pomodoroSessions || []

  // Calculate today's data
  const today = new Date()
  const todayTasks = tasks.filter((task: any) => 
    task.dueDate && new Date(task.dueDate).toDateString() === today.toDateString()
  )
  const completedTasks = tasks.filter((task: any) => task.completed).length
  const totalTasks = tasks.length
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const upcomingBills = bills.filter((bill: any) => 
    !bill.paid && new Date(bill.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ).slice(0, 5)

  const recentNotes = notes.slice(-5).reverse()

  const isThisWeek = (date: Date) => {
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)
    
    return date >= startOfWeek && date <= endOfWeek
  }

  const weeklyPomodoroSessions = pomodoroSessions.filter((session: any) => 
    isThisWeek(new Date(session.startTime))
  ).length

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  const stats = [
    {
      label: 'Tasks Completed',
      value: `${completedTasks}/${totalTasks}`,
      percentage: taskCompletionRate,
      icon: CheckSquare,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      onClick: () => onNavigate('tasks'),
    },
    {
      label: 'Upcoming Bills',
      value: upcomingBills.length,
      percentage: null,
      icon: DollarSign,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      onClick: () => onNavigate('finance'),
    },
    {
      label: 'Notes Created',
      value: notes.length,
      percentage: null,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      onClick: () => onNavigate('notes'),
    },
    {
      label: 'Pomodoro Sessions',
      value: weeklyPomodoroSessions,
      percentage: null,
      icon: Timer,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      onClick: () => onNavigate('pomodoro'),
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Good morning! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening today
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar size={16} />
          <span>{formatDate(new Date())}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              onClick={stat.onClick}
              className="p-6 rounded-xl border cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`${stat.color}`} size={24} />
                </div>
                {stat.percentage !== null && (
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp size={16} className="text-green-500" />
                    <span className="text-green-500 font-medium">{stat.percentage}%</span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Today's Tasks
            </h3>
            <CheckSquare className="text-blue-500" size={20} />
          </div>
          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No tasks scheduled for today
              </p>
            ) : (
              todayTasks.slice(0, 5).map((task: any) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 transition-all duration-200"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    readOnly
                  />
                  <div className="flex-1">
                    <p className={`font-medium ${
                      task.completed 
                        ? 'line-through text-gray-500 dark:text-gray-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Due: {formatTime(new Date(task.dueDate))}
                      </p>
                    )}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === 'URGENT_IMPORTANT' ? 'bg-red-500' :
                    task.priority === 'URGENT_NOT_IMPORTANT' ? 'bg-yellow-500' :
                    task.priority === 'NOT_URGENT_IMPORTANT' ? 'bg-blue-500' :
                    'bg-gray-500'
                  }`} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Bills */}
        <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upcoming Bills
            </h3>
            <AlertCircle className="text-red-500" size={20} />
          </div>
          <div className="space-y-3">
            {upcomingBills.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No upcoming bills
              </p>
            ) : (
              upcomingBills.map((bill: any) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 transition-all duration-200"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {bill.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Due: {formatDate(new Date(bill.dueDate))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600 dark:text-red-400">
                      ${bill.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {bill.currency}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Notes */}
        <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-200 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Notes
            </h3>
            <FileText className="text-purple-500" size={20} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentNotes.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8 col-span-2">
                No notes created yet
              </p>
            ) : (
              recentNotes.map((note: any) => (
                <div
                  key={note.id}
                  className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 transition-all duration-200"
                >
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {note.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                    {note.content}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {formatDate(new Date(note.createdAt))}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard