import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, X, Clock, Edit3 } from 'lucide-react';
import { useClientTasks, useClientBills, useClientPomodoroSessions, useClientEvents } from '@/lib/client-data-hooks';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate, getMonthDates, addMonths, isToday, getWeekDates, addDays, formatTime } from '@/utils/dateUtils';
import dayjs from 'dayjs';

type CalendarView = 'month' | 'week' | 'day';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '10:00',
    category: 'personal' as 'personal' | 'interview',
    // 面试相关字段
    interviewType: 'online' as 'online' | 'offline',
    location: '',
    contact: '',
    meetingId: '',
    company: '',
    position: ''
  });
  const { t } = useLanguage();

  const { tasks } = useClientTasks();
  const { bills } = useClientBills();
  const { sessions: pomodoroSessions } = useClientPomodoroSessions();
  const { events, createEvent, updateEvent } = useClientEvents();

  // Generate events from all data sources
  const generateEventsFromData = () => {
    const generatedEvents: any[] = [];

    // Add task events
    tasks.forEach((task: any) => {
      if (task.dueDate) {
        generatedEvents.push({
          id: `task-${task.id}`,
          title: task.title,
          description: task.description,
          startDate: new Date(task.dueDate),
          endDate: new Date(task.dueDate),
          category: 'task',
          color: task.priority === 'URGENT_IMPORTANT' ? '#ef4444' :
                 task.priority === 'URGENT_NOT_IMPORTANT' ? '#f59e0b' :
                 task.priority === 'NOT_URGENT_IMPORTANT' ? '#3b82f6' : '#6b7280',
          taskId: task.id,
        });
      }
    });

    // Add bill events
    bills.forEach((bill: any) => {
      generatedEvents.push({
        id: `bill-${bill.id}`,
        title: `Bill: ${bill.title}`,
        description: `Amount: $${bill.amount}`,
        startDate: new Date(bill.dueDate),
        endDate: new Date(bill.dueDate),
        category: 'bill',
        color: bill.paid ? '#10b981' : '#ef4444',
        billId: bill.id,
      });
    });

    // Add pomodoro session events
    pomodoroSessions.forEach((session: any) => {
      generatedEvents.push({
        id: `pomodoro-${session.id}`,
        title: `Pomodoro: ${session.type}`,
        description: session.notes || `${session.duration}min session`,
        startDate: new Date(session.startTime),
        endDate: new Date(session.endTime),
        category: 'pomodoro',
        color: session.type === 'WORK' ? '#8b5cf6' : '#10b981',
      });
    });

    return [...events, ...generatedEvents];
  };

  const allEvents = generateEventsFromData();

  // 生成时间选项（整点和半小时）
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourStr = hour.toString().padStart(2, '0');
      options.push(`${hourStr}:00`);
      options.push(`${hourStr}:30`);
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // 处理事件点击查看详情
  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setShowEventDetailModal(true);
  };

  // 处理编辑事件
  const handleEditEvent = () => {
    if (!selectedEvent) return;
    
    // 将选中的事件数据填充到编辑表单中
    const startDate = new Date(selectedEvent.startDate);
    const endDate = new Date(selectedEvent.endDate);
    
    setNewEvent({
      title: selectedEvent.title || '',
      description: selectedEvent.description || '',
      startDate: dayjs(startDate).format('YYYY-MM-DD'),
      startTime: dayjs(startDate).format('HH:mm'),
      endDate: dayjs(endDate).format('YYYY-MM-DD'),
      endTime: dayjs(endDate).format('HH:mm'),
      category: selectedEvent.category || 'personal',
      interviewType: selectedEvent.interviewType || 'online',
      location: selectedEvent.location || '',
      contact: selectedEvent.contact || '',
      meetingId: selectedEvent.meetingId || '',
      company: selectedEvent.company || '',
      position: selectedEvent.position || ''
    });
    
    setIsEditingEvent(true);
    setShowEventDetailModal(false);
    setShowAddEventModal(true);
  };

  // 快速创建面试事件
  const handleQuickCreateInterview = () => {
    const today = dayjs().format('YYYY-MM-DD');
    setNewEvent({
      title: '',
      description: '',
      startDate: today,
      startTime: '15:00',
      endDate: today,
      endTime: '15:30',
      category: 'interview',
      interviewType: 'online',
      location: '',
      contact: '',
      meetingId: '',
      company: '',
      position: '前端开发工程师'
    });
    setIsEditingEvent(false);
    setSelectedEvent(null);
    setShowAddEventModal(true);
  };

  // 根据面试信息自动填充（示例数据）
  const createSampleInterviews = () => {
    // 同程旅行面试
    const tongchengInterview = {
      title: '同程旅行 - 前端开发工程师面试',
      description: '初试面试',
      startDate: '2025-08-06',
      startTime: '15:00',
      endDate: '2025-08-06',
      endTime: '15:30',
      category: 'interview' as const,
      interviewType: 'online' as const,
      location: 'https://meeting.tencent.com/dm/gqZwAIq5hjus',
      contact: '',
      meetingId: '493939456',
      company: '同程旅行',
      position: '前端开发工程师'
    };

    // 线下面试
    const offlineInterview = {
      title: '线下面试 - 前端开发工程师',
      description: '初试-线下面试',
      startDate: '2025-08-06',
      startTime: '11:00',
      endDate: '2025-08-06',
      endTime: '12:00',
      category: 'interview' as const,
      interviewType: 'offline' as const,
      location: '上海徐汇区西岸智塔西塔楼36F',
      contact: '成克彬老师',
      meetingId: '16619750574',
      company: '',
      position: '前端开发工程师'
    };

    return [tongchengInterview, offlineInterview];
  };

  // 处理添加事件
  const handleAddEvent = () => {
    const today = dayjs().format('YYYY-MM-DD');
    setNewEvent({
      title: '',
      description: '',
      startDate: today,
      startTime: '09:00',
      endDate: today,
      endTime: '10:00',
      category: 'personal',
      interviewType: 'online',
      location: '',
      contact: '',
      meetingId: '',
      company: '',
      position: ''
    });
    setIsEditingEvent(false);
    setSelectedEvent(null);
    setShowAddEventModal(true);
  };

  // 保存事件
  const handleSaveEvent = async () => {
    if (!newEvent.title.trim()) {
      alert('请输入事件标题');
      return;
    }

    try {
      const startDateTime = new Date(`${newEvent.startDate}T${newEvent.startTime}:00`);
      const endDateTime = new Date(`${newEvent.endDate}T${newEvent.endTime}:00`);

      if (endDateTime <= startDateTime) {
        alert('结束时间必须晚于开始时间');
        return;
      }

      const eventData: any = {
        title: newEvent.title,
        description: newEvent.description,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        category: newEvent.category,
        color: newEvent.category === 'interview' ? '#10b981' : '#3b82f6'
      };

      // 如果是面试事件，添加面试相关字段
      if (newEvent.category === 'interview') {
        eventData.interviewType = newEvent.interviewType;
        eventData.location = newEvent.location;
        eventData.contact = newEvent.contact;
        eventData.meetingId = newEvent.meetingId;
        eventData.company = newEvent.company;
        eventData.position = newEvent.position;
      }

      if (isEditingEvent && selectedEvent) {
        // 编辑模式：更新现有事件
        await updateEvent({
          id: selectedEvent.id,
          ...eventData
        });
      } else {
        // 创建模式：创建新事件
        await createEvent(eventData);
      }

      setShowAddEventModal(false);
      setIsEditingEvent(false);
      setSelectedEvent(null);
      setNewEvent({
        title: '',
        description: '',
        startDate: '',
        startTime: '09:00',
        endDate: '',
        endTime: '10:00',
        category: 'personal',
        interviewType: 'online',
        location: '',
        contact: '',
        meetingId: '',
        company: '',
        position: ''
      });
    } catch (error) {
      console.error(isEditingEvent ? '更新事件失败:' : '创建事件失败:', error);
      alert(isEditingEvent ? '更新事件失败，请重试' : '创建事件失败，请重试');
    }
  };

  const getDatesForView = () => {
    switch (view) {
      case 'month':
        return getMonthDates(currentDate);
      case 'week':
        return getWeekDates(currentDate);
      case 'day':
        return [currentDate];
      default:
        return getMonthDates(currentDate);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    switch (view) {
      case 'month':
        setCurrentDate(prev => addMonths(prev, direction === 'next' ? 1 : -1));
        break;
      case 'week':
        setCurrentDate(prev => addDays(prev, direction === 'next' ? 7 : -7));
        break;
      case 'day':
        setCurrentDate(prev => addDays(prev, direction === 'next' ? 1 : -1));
        break;
    }
  };

  const getEventsForDate = (date: Date) => {
    return allEvents.filter((event: any) => 
      dayjs(event.startDate).isSame(dayjs(date), 'day')
    );
  };

  const getViewTitle = () => {
    switch (view) {
      case 'month':
        return dayjs(currentDate).format('MMMM YYYY');
      case 'week':
        const weekStart = getWeekDates(currentDate)[0];
        const weekEnd = getWeekDates(currentDate)[6];
        return `${dayjs(weekStart).format('MMM D')} - ${dayjs(weekEnd).format('MMM D, YYYY')}`;
      case 'day':
        return dayjs(currentDate).format('dddd, MMMM D, YYYY');
      default:
        return '';
    }
  };

  const viewButtons = [
    { id: 'month', label: t('month') },
    { id: 'week', label: t('week') },
    { id: 'day', label: t('day') },
  ];

  const dates = getDatesForView();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('calendar')}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors duration-200"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white min-w-[250px] text-center">
              {getViewTitle()}
            </h3>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors duration-200"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            {viewButtons.map((button) => (
              <button
                key={button.id}
                onClick={() => setView(button.id as CalendarView)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  view === button.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {button.label}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleAddEvent}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              <Plus size={20} />
              {t('addEvent')}
            </button>
            <button
              onClick={handleQuickCreateInterview}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <Plus size={20} />
              面试
            </button>
            <button
              onClick={async () => {
                const samples = createSampleInterviews();
                for (const sample of samples) {
                  const startDateTime = new Date(`${sample.startDate}T${sample.startTime}:00`);
                  const endDateTime = new Date(`${sample.endDate}T${sample.endTime}:00`);
                  await createEvent({
                    title: sample.title,
                    description: sample.description,
                    startDate: startDateTime.toISOString(),
                    endDate: endDateTime.toISOString(),
                    category: sample.category,
                    color: '#10b981',
                    interviewType: sample.interviewType,
                    location: sample.location,
                    contact: sample.contact,
                    meetingId: sample.meetingId,
                    company: sample.company,
                    position: sample.position
                  });
                }
              }}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm"
            >
              示例
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Days of Week Header (for month and week view) */}
        {(view === 'month' || view === 'week') && (
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="p-4 text-center font-medium text-sm bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {day}
              </div>
            ))}
          </div>
        )}

        {/* Calendar Content */}
        {view === 'month' && (
          <div className="grid grid-cols-7">
            {dates.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const isSelected = dayjs(selectedDate).isSame(dayjs(date), 'day');
              const isTodayDate = isToday(date);
              
              return (
                <div
                  key={index}
                  onClick={() => onDateSelect(date)}
                  className={`min-h-[120px] p-3 border-b border-r border-gray-200 dark:border-gray-700 cursor-pointer transition-colors duration-200 ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      isTodayDate
                        ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center'
                        : isSelected
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-white'
                    }`}>
                      {date.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="flex items-center gap-1">
                        {dayEvents.slice(0, 3).map((event: any, i: number) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: event.color }}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{dayEvents.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event: any, i: number) => (
                      <div
                        key={i}
                        className="text-xs p-1 rounded truncate bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                        style={{ borderLeft: `2px solid ${event.color}` }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === 'week' && (
          <div className="grid grid-cols-7">
            {dates.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const isSelected = dayjs(selectedDate).isSame(dayjs(date), 'day');
              const isTodayDate = isToday(date);
              
              return (
                <div
                  key={index}
                  onClick={() => onDateSelect(date)}
                  className={`min-h-[200px] p-3 border-r border-gray-200 dark:border-gray-700 cursor-pointer transition-colors duration-200 ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="text-center mb-3">
                    <span className={`text-lg font-medium ${
                      isTodayDate
                        ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto'
                        : isSelected
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-white'
                    }`}>
                      {date.getDate()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {dayEvents.map((event: any, i: number) => (
                      <div
                        key={i}
                        className="text-xs p-2 rounded bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                        style={{ borderLeft: `3px solid ${event.color}` }}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-xs opacity-75">
                          {formatTime(new Date(event.startDate))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === 'day' && (
          <div className="p-6">
            <div className="space-y-3">
              {getEventsForDate(currentDate).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No events scheduled for this date
                </p>
              ) : (
                getEventsForDate(currentDate).map((event: any) => (
                  <div
                  key={event.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 transition-all duration-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleEventClick(event)}
                >
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: event.color }} />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </h4>
                      {event.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {event.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {formatTime(new Date(event.startDate))} - {formatTime(new Date(event.endDate))}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      event.category === 'task' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      event.category === 'bill' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      event.category === 'note' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                      event.category === 'pomodoro' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                      event.category === 'interview' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {event.category === 'interview' ? '面试' : event.category}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Date Events (for month view) */}
      {view === 'month' && selectedDate && (
        <div className="rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Events for {formatDate(selectedDate, '24')}
          </h3>
          
          <div className="space-y-3">
            {getEventsForDate(selectedDate).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No events scheduled for this date
              </p>
            ) : (
              getEventsForDate(selectedDate).map((event: any) => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 transition-all duration-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: event.color }} />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </h4>
                    {event.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {event.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {formatTime(new Date(event.startDate))} - {formatTime(new Date(event.endDate))}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    event.category === 'task' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    event.category === 'bill' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    event.category === 'note' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                    event.category === 'pomodoro' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                    event.category === 'interview' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {event.category === 'interview' ? '面试' : event.category}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 添加事件模态框 */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditingEvent ? '编辑事件' : '添加事件'}
              </h3>
              <button
                onClick={() => {
                  setShowAddEventModal(false);
                  setIsEditingEvent(false);
                  setSelectedEvent(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* 事件标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  事件标题 *
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入事件标题"
                />
              </div>

              {/* 事件类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  事件类型 *
                </label>
                <select
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as 'personal' | 'interview' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="personal">个人事件</option>
                  <option value="interview">面试</option>
                </select>
              </div>

              {/* 事件描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  事件描述
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入事件描述（可选）"
                  rows={3}
                />
              </div>

              {/* 面试相关字段 */}
              {newEvent.category === 'interview' && (
                <>
                  {/* 公司和职位 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        公司名称
                      </label>
                      <input
                        type="text"
                        value={newEvent.company}
                        onChange={(e) => setNewEvent({ ...newEvent, company: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="公司名称"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        应聘职位
                      </label>
                      <input
                        type="text"
                        value={newEvent.position}
                        onChange={(e) => setNewEvent({ ...newEvent, position: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="应聘职位"
                      />
                    </div>
                  </div>

                  {/* 面试形式 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      面试形式 *
                    </label>
                    <select
                      value={newEvent.interviewType}
                      onChange={(e) => setNewEvent({ ...newEvent, interviewType: e.target.value as 'online' | 'offline' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="online">线上面试</option>
                      <option value="offline">线下面试</option>
                    </select>
                  </div>

                  {/* 地址/会议链接 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {newEvent.interviewType === 'online' ? '会议链接' : '面试地址'}
                    </label>
                    <input
                      type="text"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={newEvent.interviewType === 'online' ? '会议链接' : '面试地址'}
                    />
                  </div>

                  {/* 会议号和联系人 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {newEvent.interviewType === 'online' ? '会议号' : '联系电话'}
                      </label>
                      <input
                        type="text"
                        value={newEvent.meetingId}
                        onChange={(e) => setNewEvent({ ...newEvent, meetingId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={newEvent.interviewType === 'online' ? '会议号' : '联系电话'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        联系人
                      </label>
                      <input
                        type="text"
                        value={newEvent.contact}
                        onChange={(e) => setNewEvent({ ...newEvent, contact: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="联系人"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 开始时间 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    开始日期
                  </label>
                  <input
                    type="date"
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    开始时间
                  </label>
                  <select
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 结束时间 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    结束日期
                  </label>
                  <input
                    type="date"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    结束时间
                  </label>
                  <select
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddEventModal(false);
                    setIsEditingEvent(false);
                    setSelectedEvent(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEvent}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditingEvent ? '更新事件' : '保存事件'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 事件详情模态框 */}
      {showEventDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                事件详情
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEditEvent}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                  title="编辑事件"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => setShowEventDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                  title="关闭"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* 事件标题 */}
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedEvent.title}
                </h4>
                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                  selectedEvent.category === 'task' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                  selectedEvent.category === 'bill' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                  selectedEvent.category === 'note' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                  selectedEvent.category === 'pomodoro' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                  selectedEvent.category === 'interview' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {selectedEvent.category === 'interview' ? '面试' : selectedEvent.category}
                </div>
              </div>

              {/* 时间信息 */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">时间</span>
                </div>
                <p className="text-gray-900 dark:text-white">
                  {formatTime(new Date(selectedEvent.startDate))} - {formatTime(new Date(selectedEvent.endDate))}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(new Date(selectedEvent.startDate), '24')}
                </p>
              </div>

              {/* 描述 */}
              {selectedEvent.description && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">描述</h5>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              {/* 面试详细信息 */}
              {selectedEvent.category === 'interview' && (
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-2">
                    面试信息
                  </h5>
                  
                  {selectedEvent.company && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">公司:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedEvent.company}</span>
                    </div>
                  )}
                  
                  {selectedEvent.position && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">职位:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedEvent.position}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">面试形式:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedEvent.interviewType === 'online' ? '线上面试' : '线下面试'}
                    </span>
                  </div>
                  
                  {selectedEvent.location && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                        {selectedEvent.interviewType === 'online' ? '会议链接:' : '面试地址:'}
                      </span>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        {selectedEvent.interviewType === 'online' ? (
                          <a 
                            href={selectedEvent.location} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                          >
                            {selectedEvent.location}
                          </a>
                        ) : (
                          <span className="text-gray-900 dark:text-white">{selectedEvent.location}</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedEvent.meetingId && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedEvent.interviewType === 'online' ? '会议号:' : '联系电话:'}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedEvent.meetingId}</span>
                    </div>
                  )}
                  
                  {selectedEvent.contact && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">联系人:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedEvent.contact}</span>
                    </div>
                  )}
                </div>
              )}


            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;