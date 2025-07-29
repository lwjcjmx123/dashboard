import dayjs from 'dayjs';

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
  const startOfWeek = dayjs(date).startOf('week');
  const week = [];
  for (let i = 0; i < 7; i++) {
    week.push(startOfWeek.add(i, 'day').toDate());
  }
  return week;
};

export const getMonthDates = (date: Date): Date[] => {
  const startOfMonth = dayjs(date).startOf('month');
  const daysInMonth = dayjs(date).daysInMonth();
  
  const dates = [];
  for (let day = 0; day < daysInMonth; day++) {
    dates.push(startOfMonth.add(day, 'day').toDate());
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