import React from 'react';
import { BarChart3, TrendingUp, Clock, CheckSquare, DollarSign, FileText } from 'lucide-react';
import { useQuery } from '@apollo/client';
import { GET_TASKS, GET_POMODORO_SESSIONS, GET_EXPENSES, GET_NOTES, GET_BILLS } from '@/lib/graphql/queries';
import { isThisWeek, isToday, minutesToHours } from '@/utils/dateUtils';
import dayjs from 'dayjs';

const Analytics: React.FC = () => {
  const { data: tasksData } = useQuery(GET_TASKS);
  const { data: pomodoroData } = useQuery(GET_POMODORO_SESSIONS);
  const { data: expensesData } = useQuery(GET_EXPENSES);
  const { data: notesData } = useQuery(GET_NOTES);
  const { data: billsData } = useQuery(GET_BILLS);

  const tasks = tasksData?.tasks || [];
  const pomodoroSessions = pomodoroData?.pomodoroSessions || [];
  const expenses = expensesData?.expenses || [];
  const notes = notesData?.notes || [];
  const bills = billsData?.bills || [];

  // Calculate metrics
  const completedTasks = tasks.filter((task: any) => task.completed).length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const todayTasks = tasks.filter((task: any) => 
    task.dueDate && isToday(new Date(task.dueDate))
  );
  const todayCompletedTasks = todayTasks.filter((task: any) => task.completed).length;
  const todayTasksRate = todayTasks.length > 0 ? (todayCompletedTasks / todayTasks.length) * 100 : 0;

  const weeklyPomodoros = pomodoroSessions.filter((session: any) => 
    isThisWeek(new Date(session.startTime)) && session.type === 'WORK'
  );
  const weeklyPomodoroTime = weeklyPomodoros.reduce((sum: number, session: any) => sum + session.duration, 0);

  const thisWeekExpenses = expenses.filter((expense: any) => 
    isThisWeek(new Date(expense.date))
  );
  const weeklyExpenseTotal = thisWeekExpenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);

  const unpaidBills = bills.filter((bill: any) => !bill.paid);
  const unpaidBillsTotal = unpaidBills.reduce((sum: number, bill: any) => sum + bill.amount, 0);

  const weeklyNotes = notes.filter((note: any) => 
    isThisWeek(new Date(note.createdAt))
  );

  // Priority distribution
  const priorityDistribution = {
    'URGENT_IMPORTANT': tasks.filter((t: any) => t.priority === 'URGENT_IMPORTANT').length,
    'URGENT_NOT_IMPORTANT': tasks.filter((t: any) => t.priority === 'URGENT_NOT_IMPORTANT').length,
    'NOT_URGENT_IMPORTANT': tasks.filter((t: any) => t.priority === 'NOT_URGENT_IMPORTANT').length,
    'NOT_URGENT_NOT_IMPORTANT': tasks.filter((t: any) => t.priority === 'NOT_URGENT_NOT_IMPORTANT').length,
  };

  // Expense categories
  const expenseCategories = expenses.reduce((acc: any, expense: any) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const topExpenseCategories = Object.entries(expenseCategories)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5);

  // Weekly activity data (last 7 days)
  const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
    const date = dayjs().subtract(i, 'day');
    
    const dayTasks = tasks.filter((task: any) => 
      task.updatedAt && dayjs(task.updatedAt).isSame(dayjs(date), 'day')
    );
    const dayPomodoros = pomodoroSessions.filter((session: any) => 
      dayjs(session.startTime).isSame(dayjs(date), 'day')
    );
    const dayExpenses = expenses.filter((expense: any) => 
      dayjs(expense.date).isSame(dayjs(date), 'day')
    );
    const dayNotes = notes.filter((note: any) => 
      dayjs(note.createdAt).isSame(dayjs(date), 'day')
    );

    return {
      date: dayjs(date).format('MMM D'),
      tasks: dayTasks.length,
      pomodoros: dayPomodoros.length,
      expenses: dayExpenses.length,
      notes: dayNotes.length,
    };
  }).reverse();

  const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);

  const stats = [
    {
      label: 'Task Completion Rate',
      value: `${taskCompletionRate.toFixed(1)}%`,
      change: todayTasksRate - taskCompletionRate,
      icon: CheckSquare,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Weekly Focus Time',
      value: minutesToHours(weeklyPomodoroTime),
      change: weeklyPomodoros.length - 20, // Compared to target of 20 sessions
      icon: Clock,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Weekly Expenses',
      value: `$${weeklyExpenseTotal.toFixed(2)}`,
      change: null,
      icon: DollarSign,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'Notes Created',
      value: weeklyNotes.length,
      change: null,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Insights into your productivity and habits
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <BarChart3 size={16} />
          <span>Last 7 days</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`${stat.color}`} size={24} />
                </div>
                {stat.change !== null && (
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp 
                      size={16} 
                      className={stat.change >= 0 ? 'text-green-500' : 'text-red-500 rotate-180'} 
                    />
                    <span className={`font-medium ${stat.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(stat.change).toFixed(1)}%
                    </span>
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
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Activity
          </h3>
          <div className="space-y-4">
            {weeklyActivity.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 text-sm text-gray-600 dark:text-gray-400">
                  {day.date}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{day.tasks}T</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{day.pomodoros}P</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{day.notes}N</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Tasks</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Pomodoros</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Notes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Task Priority Distribution */}
        <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Task Priority Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(priorityDistribution).map(([priority, count]) => {
              const percentage = totalTasks > 0 ? ((count as number) / totalTasks) * 100 : 0;
              const colors = {
                'URGENT_IMPORTANT': 'bg-red-500',
                'URGENT_NOT_IMPORTANT': 'bg-yellow-500',
                'NOT_URGENT_IMPORTANT': 'bg-blue-500',
                'NOT_URGENT_NOT_IMPORTANT': 'bg-gray-500',
              };
              const labels = {
                'URGENT_IMPORTANT': 'Urgent & Important',
                'URGENT_NOT_IMPORTANT': 'Urgent',
                'NOT_URGENT_IMPORTANT': 'Important',
                'NOT_URGENT_NOT_IMPORTANT': 'Low Priority',
              };
              
              return (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colors[priority as keyof typeof colors]}`}></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {labels[priority as keyof typeof labels]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {count as number}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Expense Categories */}
        <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Expense Categories
          </h3>
          <div className="space-y-3">
            {topExpenseCategories.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No expenses recorded yet
              </p>
            ) : (
              topExpenseCategories.map(([category, amount]) => {
                const percentage = totalExpenses > 0 ? ((amount as number) / totalExpenses) * 100 : 0;
                
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ${(amount as number).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Productivity Insights */}
        <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Productivity Insights
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Average session length
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {pomodoroSessions.length > 0 
                  ? minutesToHours(pomodoroSessions.reduce((sum: number, s: any) => sum + s.duration, 0) / pomodoroSessions.length)
                  : '0m'
                }
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Most productive day
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Monday
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Overdue tasks
              </span>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                {tasks.filter((task: any) => 
                  task.dueDate && dayjs(task.dueDate).isBefore(dayjs()) && !task.completed
                ).length}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Upcoming bills
              </span>
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                ${unpaidBillsTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;