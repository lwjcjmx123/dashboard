import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatDate, getMonthDates, addMonths, isToday, getWeekDates, addDays } from '../../utils/dateUtils';
import { Event } from '../../types';

type CalendarView = 'month' | 'week' | 'day';

const Calendar: React.FC = () => {
  const { state, dispatch } = useApp();
  const { events, selectedDate, settings, tasks, bills, notes, pomodoroSessions } = state;
  const isDark = settings.theme === 'dark';
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');

  // Generate events from all data sources
  const generateEventsFromData = (): Event[] => {
    const generatedEvents: Event[] = [];

    // Add task events
    tasks.forEach(task => {
      if (task.dueDate) {
        generatedEvents.push({
          id: `task-${task.id}`,
          title: task.title,
          description: task.description,
          startDate: new Date(task.dueDate),
          endDate: new Date(task.dueDate),
          category: 'task',
          color: task.priority === 'urgent-important' ? '#ef4444' :
                 task.priority === 'urgent-not-important' ? '#f59e0b' :
                 task.priority === 'not-urgent-important' ? '#3b82f6' : '#6b7280',
          taskId: task.id,
        });
      }
    });

    // Add bill events
    bills.forEach(bill => {
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
    pomodoroSessions.forEach(session => {
      generatedEvents.push({
        id: `pomodoro-${session.id}`,
        title: `Pomodoro: ${session.type}`,
        description: session.notes || `${session.duration}min session`,
        startDate: new Date(session.startTime),
        endDate: new Date(session.endTime),
        category: 'pomodoro',
        color: session.type === 'work' ? '#8b5cf6' : '#10b981',
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

  const selectDate = (date: Date) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date });
  };

  const getEventsForDate = (date: Date) => {
    return allEvents.filter(event => 
      new Date(event.startDate).toDateString() === date.toDateString()
    );
  };

  const getViewTitle = () => {
    switch (view) {
      case 'month':
        return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
      case 'week':
        const weekStart = getWeekDates(currentDate)[0];
        const weekEnd = getWeekDates(currentDate)[6];
        return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
      case 'day':
        return currentDate.toLocaleDateString('default', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
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
              className={`p-2 rounded-lg ${
                isDark 
                  ? 'hover:bg-gray-800 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              } transition-colors duration-200`}
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white min-w-[250px] text-center">
              {getViewTitle()}
            </h3>
            <button
              onClick={() => navigateDate('next')}
              className={`p-2 rounded-lg ${
                isDark 
                  ? 'hover:bg-gray-800 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              } transition-colors duration-200`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className={`flex rounded-lg border ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            {viewButtons.map((button) => (
              <button
                key={button.id}
                onClick={() => setView(button.id as CalendarView)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  view === button.id
                    ? 'bg-blue-600 text-white'
                    : isDark
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-50'
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
      <div className={`rounded-xl border ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } overflow-hidden`}>
        {/* Days of Week Header (for month and week view) */}
        {(view === 'month' || view === 'week') && (
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className={`p-4 text-center font-medium text-sm ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-50 text-gray-700'
                }`}
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
              const isSelected = selectedDate.toDateString() === date.toDateString();
              const isTodayDate = isToday(date);
              
              return (
                <div
                  key={index}
                  onClick={() => selectDate(date)}
                  className={`min-h-[120px] p-3 border-b border-r border-gray-200 dark:border-gray-700 cursor-pointer transition-colors duration-200 ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : isDark
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-50'
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
                        {dayEvents.slice(0, 3).map((event, i) => (
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
                    {dayEvents.slice(0, 2).map((event, i) => (
                      <div
                        key={i}
                        className={`text-xs p-1 rounded truncate ${
                          isDark 
                            ? 'bg-gray-600 text-gray-200' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
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
              const isSelected = selectedDate.toDateString() === date.toDateString();
              const isTodayDate = isToday(date);
              
              return (
                <div
                  key={index}
                  onClick={() => selectDate(date)}
                  className={`min-h-[200px] p-3 border-r border-gray-200 dark:border-gray-700 cursor-pointer transition-colors duration-200 ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : isDark
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-50'
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
                    {dayEvents.map((event, i) => (
                      <div
                        key={i}
                        className={`text-xs p-2 rounded ${
                          isDark 
                            ? 'bg-gray-600 text-gray-200' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                        style={{ borderLeft: `3px solid ${event.color}` }}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-xs opacity-75">
                          {new Date(event.startDate).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
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
                getEventsForDate(currentDate).map((event) => (
                  <div
                    key={event.id}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      isDark ? 'bg-gray-700' : 'bg-gray-50'
                    } transition-all duration-200`}
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
                        {new Date(event.startDate).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - {new Date(event.endDate).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
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
        <div className={`rounded-xl border ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } p-6`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Events for {formatDate(selectedDate, settings.timeFormat)}
          </h3>
          
          <div className="space-y-3">
            {getEventsForDate(selectedDate).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No events scheduled for this date
              </p>
            ) : (
              getEventsForDate(selectedDate).map((event) => (
                <div
                  key={event.id}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  } transition-all duration-200`}
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
                      {new Date(event.startDate).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} - {new Date(event.endDate).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
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