import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { CheckSquare, DollarSign, FileText, Timer, TrendingUp, Calendar, Clock, AlertCircle } from 'lucide-react';
import { isToday, isThisWeek, formatDate, formatTime } from '../../utils/dateUtils';

const Dashboard: React.FC = () => {
  const { state, dispatch } = useApp();
  const { tasks, events, bills, notes, pomodoroSessions, settings } = state;
  const isDark = settings.theme === 'dark';

  // Calculate today's data
  const todayTasks = tasks.filter(task => 
    task.dueDate && isToday(new Date(task.dueDate))
  );
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const todayEvents = events.filter(event => 
    isToday(new Date(event.startDate))
  );

  const upcomingBills = bills.filter(bill => 
    !bill.paid && new Date(bill.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ).slice(0, 5);

  const recentNotes = notes.slice(-5).reverse();

  const weeklyPomodoroSessions = pomodoroSessions.filter(session => 
    isThisWeek(new Date(session.startTime))
  ).length;

  const handleNavigate = (view: string) => {
    dispatch({ type: 'SET_VIEW', payload: view as any });
  };

  const stats = [
    {
      label: 'Tasks Completed',
      value: `${completedTasks}/${totalTasks}`,
      percentage: taskCompletionRate,
      icon: CheckSquare,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      onClick: () => handleNavigate('tasks'),
    },
    {
      label: 'Upcoming Bills',
      value: upcomingBills.length,
      percentage: null,
      icon: DollarSign,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      onClick: () => handleNavigate('finance'),
    },
    {
      label: 'Notes Created',
      value: notes.length,
      percentage: null,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      onClick: () => handleNavigate('notes'),
    },
    {
      label: 'Pomodoro Sessions',
      value: weeklyPomodoroSessions,
      percentage: null,
      icon: Timer,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      onClick: () => handleNavigate('pomodoro'),
    },
  ];

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
          <span>{formatDate(new Date(), settings.timeFormat)}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              onClick={stat.onClick}
              className={`p-6 rounded-xl border cursor-pointer ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              } transition-all duration-200 hover:shadow-lg`}
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
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className={`p-6 rounded-xl border ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } transition-all duration-200`}>
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
              todayTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  } transition-all duration-200`}
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
                        Due: {formatTime(new Date(task.dueDate), settings.timeFormat)}
                      </p>
                    )}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === 'urgent-important' ? 'bg-red-500' :
                    task.priority === 'urgent-not-important' ? 'bg-yellow-500' :
                    task.priority === 'not-urgent-important' ? 'bg-blue-500' :
                    'bg-gray-500'
                  }`} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Events */}
        <div className={`p-6 rounded-xl border ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } transition-all duration-200`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Today's Events
            </h3>
            <Calendar className="text-green-500" size={20} />
          </div>
          <div className="space-y-3">
            {todayEvents.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No events scheduled for today
              </p>
            ) : (
              todayEvents.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  } transition-all duration-200`}
                >
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: event.color }} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(new Date(event.startDate), settings.timeFormat)} - {formatTime(new Date(event.endDate), settings.timeFormat)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Bills */}
        <div className={`p-6 rounded-xl border ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } transition-all duration-200`}>
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
              upcomingBills.map((bill) => (
                <div
                  key={bill.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  } transition-all duration-200`}
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {bill.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Due: {formatDate(new Date(bill.dueDate), settings.timeFormat)}
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
        <div className={`p-6 rounded-xl border ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } transition-all duration-200`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Notes
            </h3>
            <FileText className="text-purple-500" size={20} />
          </div>
          <div className="space-y-3">
            {recentNotes.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No notes created yet
              </p>
            ) : (
              recentNotes.map((note) => (
                <div
                  key={note.id}
                  className={`p-3 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  } transition-all duration-200`}
                >
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {note.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                    {note.content}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {formatDate(new Date(note.createdAt), settings.timeFormat)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;