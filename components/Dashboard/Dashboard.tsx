"use client";

import React from "react";
import {
  CheckSquare,
  DollarSign,
  FileText,
  Timer,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  useClientTasks,
  useClientBills,
  useClientNotes,
  useClientPomodoroSessions,
  useClientUserSettings,
  useClientEvents,
} from "@/lib/client-data-hooks";
import { isThisWeek, formatDate, formatTime } from "../../utils/dateUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import LoadingSkeleton from './LoadingSkeleton';
import ErrorState from './ErrorState';
import dayjs from "dayjs";
import { seedTestData, clearTestData } from "@/lib/test-data-seeder";

interface DashboardProps {
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { tasks, loading: tasksLoading, error: tasksError, refetch: refetchTasks } = useClientTasks();
  const { bills, loading: billsLoading, error: billsError, refetch: refetchBills } = useClientBills();
  const { notes, loading: notesLoading, error: notesError, refetch: refetchNotes } = useClientNotes();
  const { sessions: pomodoroSessions, loading: sessionsLoading, error: sessionsError, refetch: refetchSessions } = useClientPomodoroSessions();
  const { events, loading: eventsLoading, error: eventsError, refetch: refetchEvents } = useClientEvents();
  const { settings } = useClientUserSettings();

  // 检查是否有任何加载状态或错误
  const isLoading = tasksLoading || billsLoading || notesLoading || sessionsLoading || eventsLoading;
  const hasError = tasksError || billsError || notesError || sessionsError || eventsError;

  // 重试所有数据加载
  const handleRetry = () => {
    refetchTasks?.();
    refetchBills?.();
    refetchNotes?.();
    refetchSessions?.();
    refetchEvents?.();
  };

  // Currency symbol mapping
  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      CNY: "¥",
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
    };
    return symbols[currency] || "$";
  };

  const currencySymbol = settings ? getCurrencySymbol(settings.currency) : "$";

  // Calculate today's data
  const todayTasks = tasks.filter(
    (task: any) => task.dueDate && dayjs(task.dueDate).isSame(dayjs(), "day")
  );
  const completedTasks = tasks.filter((task: any) => task.completed).length;
  const totalTasks = tasks.length;
  const taskCompletionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const upcomingBills = bills
    .filter(
      (bill: any) =>
        !bill.paid && dayjs(bill.dueDate).isBefore(dayjs().add(7, "day"))
    )
    .slice(0, 5);

  const recentNotes = notes.slice(-5).reverse();

  const weeklyPomodoroSessions = pomodoroSessions.filter((session: any) =>
    isThisWeek(new Date(session.startTime))
  ).length;

  // Calculate today's events and upcoming events
  const todayEvents = events.filter((event: any) => {
    const eventDate = dayjs(event.start);
    return eventDate.isSame(dayjs(), "day");
  });

  const upcomingEvents = events
    .filter((event: any) => {
      const eventDate = dayjs(event.start);
      return eventDate.isAfter(dayjs()) && eventDate.isBefore(dayjs().add(7, "day"));
    })
    .sort((a: any, b: any) => dayjs(a.start).diff(dayjs(b.start)))
    .slice(0, 5);

  const totalEvents = events.length;

  const stats = [
    {
      label: t("tasksCompleted"),
      value: `${completedTasks}/${totalTasks}`,
      percentage: taskCompletionRate,
      icon: CheckSquare,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      onClick: () => onNavigate("tasks"),
    },
    {
      label: t("upcomingBills"),
      value: upcomingBills.length,
      percentage: null,
      icon: DollarSign,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      onClick: () => onNavigate("finance"),
    },
    {
      label: t("notesCreated"),
      value: notes.length,
      percentage: null,
      icon: FileText,
      color: "text-primary-600 dark:text-primary-400",
      bgColor: "bg-primary-50 dark:bg-primary-900/20",
      onClick: () => onNavigate("notes"),
    },
    {
      label: t("pomodoroSessions"),
      value: weeklyPomodoroSessions,
      percentage: null,
      icon: Timer,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      onClick: () => onNavigate("pomodoro"),
    },
    {
      label: t("calendarEvents"),
      value: totalEvents,
      percentage: null,
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      onClick: () => onNavigate("calendar"),
    },
  ];

  // 如果正在加载，显示骨架屏
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // 如果有错误，显示错误状态
  if (hasError) {
    const errorMessage = tasksError || billsError || notesError || sessionsError || eventsError;
    return (
      <ErrorState 
        error={errorMessage?.message || '数据加载失败'} 
        onRetry={handleRetry} 
        showRetry={true}
      />
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("goodMorning")} 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t("happeningToday")}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar size={16} />
          <span>{formatDate(dayjs().toDate())}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              onClick={stat.onClick}
              className="p-4 md:p-6 rounded-xl border cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 md:p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`${stat.color}`} size={20} />
                </div>
                {stat.percentage !== null && (
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp size={16} className="text-green-500" />
                    <span className="text-green-500 font-medium">
                      {stat.percentage}%
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Today's Tasks */}
        <div className="p-4 md:p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("todayTasks")}
            </h3>
            <CheckSquare className="text-primary-500" size={20} />
          </div>
          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-700 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {t('dashboardNoTasksToday')}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {t('dashboardAllTasksCompleted')}
                </p>
              </div>
            ) : (
              todayTasks.slice(0, 5).map((task: any) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    readOnly
                  />
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        task.completed
                          ? "line-through text-gray-500 dark:text-gray-400"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t("dueDate")}: {formatTime(new Date(task.dueDate))}
                      </p>
                    )}
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      task.priority === "URGENT_IMPORTANT"
                        ? "bg-red-500"
                        : task.priority === "URGENT_NOT_IMPORTANT"
                        ? "bg-yellow-500"
                        : task.priority === "NOT_URGENT_IMPORTANT"
                        ? "bg-primary-500"
                        : "bg-gray-500"
                    }`}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Bills */}
        <div className="p-4 md:p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("upcomingBills")}
            </h3>
            <AlertCircle className="text-red-500" size={20} />
          </div>
          <div className="space-y-3">
            {upcomingBills.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-green-500 dark:text-green-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {t('dashboardNoBillsDue')}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {t('dashboardFinanciallyOnTrack')}
                </p>
              </div>
            ) : (
              upcomingBills.map((bill: any) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {bill.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("dueDate")}: {formatDate(new Date(bill.dueDate))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600 dark:text-red-400">
                      {currencySymbol}
                      {bill.amount.toFixed(2)}
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

        {/* Today's Events */}
        <div className="p-4 md:p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("todayEvents")}
            </h3>
            <Calendar className="text-blue-500" size={20} />
          </div>
          <div className="space-y-3">
            {todayEvents.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {t('dashboardNoEventsToday')}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {t('dashboardRelaxingDay')}
                </p>
              </div>
            ) : (
              todayEvents.slice(0, 5).map((event: any) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 cursor-pointer"
                >
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0`}
                    style={{ backgroundColor: event.color || '#3B82F6' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatTime(new Date(event.start))}</span>
                      {event.end && (
                        <>
                          <span>-</span>
                          <span>{formatTime(new Date(event.end))}</span>
                        </>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                    {event.category && (
                      <span className="px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-600">
                        {t(event.category.toLowerCase())}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="p-4 md:p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("upcomingEvents")}
            </h3>
            <Calendar className="text-orange-500" size={20} />
          </div>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {t('dashboardNoUpcomingEvents')}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {t('dashboardScheduleIsClear')}
                </p>
              </div>
            ) : (
              upcomingEvents.map((event: any) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 cursor-pointer"
                >
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0`}
                    style={{ backgroundColor: event.color || '#F59E0B' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatDate(new Date(event.start))}</span>
                      <span>{formatTime(new Date(event.start))}</span>
                    </div>
                    {event.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                    {event.category && (
                      <span className="px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-600">
                        {t(event.category.toLowerCase())}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Notes */}
        <div className="p-4 md:p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 md:col-span-2 xl:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("recentNotes")}
            </h3>
            <FileText className="text-purple-500" size={20} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentNotes.length === 0 ? (
              <div className="text-center py-8 col-span-2">
                <div className="p-4 rounded-full bg-yellow-100 dark:bg-yellow-900/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {t('dashboardNoRecentNotes')}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {t('dashboardStartWriting')}
                </p>
              </div>
            ) : (
              recentNotes.map((note: any) => (
                <div
                  key={note.id}
                  className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 cursor-pointer"
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
  );
};

export default Dashboard;
