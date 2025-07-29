import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useQuery } from '@apollo/client';
import { GET_TASKS, GET_BILLS, GET_POMODORO_SESSIONS, GET_EVENTS } from '@/lib/graphql/queries';
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

  const { data: tasksData } = useQuery(GET_TASKS);
  const { data: billsData } = useQuery(GET_BILLS);
  const { data: pomodoroData } = useQuery(GET_POMODORO_SESSIONS);
  const { data: eventsData } = useQuery(GET_EVENTS);

  const tasks = tasksData?.tasks || [];
  const bills = billsData?.bills || [];
  const pomodoroSessions = pomodoroData?.pomodoroSessions || [];
  const events = eventsData?.events || [];

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
    { id: 'month', label: 'Month' },
    { id: 'week', label: 'Week' },
    { id: 'day', label: 'Day' },
  ];

  const dates = getDatesForView();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Calendar
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
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {button.label}
              </button>
            ))}
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
            <Plus size={20} />
            Add Event
          </button>
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
                        className="text-xs p-1 rounded truncate bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                        style={{ borderLeft: `2px solid ${event.color}` }}
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
                    className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 transition-all duration-200"
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
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {event.category}
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
                  className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 transition-all duration-200"
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
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {event.category}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;