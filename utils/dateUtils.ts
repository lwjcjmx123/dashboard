import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';

// 扩展dayjs插件
dayjs.extend(weekday);

export const formatDate = (date: Date, format: '12' | '24' = '24'): string => {
  return dayjs(date).format('MMM D, YYYY');
};

export const formatTime = (date: Date, format: '12' | '24' = '24'): string => {
  return format === '12' ? dayjs(date).format('h:mm A') : dayjs(date).format('HH:mm');
};

export const formatDateTime = (date: Date, format: '12' | '24' = '24'): string => {
  return `${formatDate(date, format)} ${formatTime(date, format)}`;
};

export const isToday = (date: Date): boolean => {
  return dayjs(date).isSame(dayjs(), 'day');
};

export const isThisWeek = (date: Date): boolean => {
  return dayjs(date).isSame(dayjs(), 'week');
};

export const getWeekDates = (date: Date): Date[] => {
  // 使用周一作为一周的开始 (weekday(1) 表示周一)
  const startOfWeek = dayjs(date).weekday(1).startOf('day');
  const week = [];
  for (let i = 0; i < 7; i++) {
    week.push(startOfWeek.add(i, 'day').toDate());
  }
  return week;
};

export const getMonthDates = (date: Date): Date[] => {
  const startOfMonth = dayjs(date).startOf('month');
  const endOfMonth = dayjs(date).endOf('month');
  
  // 获取包含月初的那一周的周一
  const startDate = startOfMonth.weekday() === 0 
    ? startOfMonth.subtract(6, 'day') // 如果月初是周日，往前推6天到周一
    : startOfMonth.weekday(1); // 否则获取那一周的周一
    
  // 获取包含月末的那一周的周日  
  const endDate = endOfMonth.weekday() === 0
    ? endOfMonth // 如果月末是周日，就是周日
    : endOfMonth.weekday(7); // 否则获取那一周的周日
  
  const dates = [];
  let currentDate = startDate;
  
  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
    dates.push(currentDate.toDate());
    currentDate = currentDate.add(1, 'day');
  }
  
  return dates;
};

export const addDays = (date: Date, days: number): Date => {
  return dayjs(date).add(days, 'day').toDate();
};

export const addWeeks = (date: Date, weeks: number): Date => {
  return dayjs(date).add(weeks, 'week').toDate();
};

export const addMonths = (date: Date, months: number): Date => {
  return dayjs(date).add(months, 'month').toDate();
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const minutesToHours = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};