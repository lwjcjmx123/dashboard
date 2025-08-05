// Core types for the Personal Management System
export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  category: 'task' | 'bill' | 'note' | 'pomodoro' | 'personal' | 'interview';
  color: string;
  recurrence?: RecurrencePattern;
  taskId?: string;
  billId?: string;
  noteId?: string;
  // 面试相关字段
  interviewType?: 'online' | 'offline';
  location?: string; // 线下面试地址或线上会议链接
  contact?: string; // 联系人信息
  meetingId?: string; // 会议号

}

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  count?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'urgent-important' | 'urgent-not-important' | 'not-urgent-important' | 'not-urgent-not-important';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  subtasks: SubTask[];
  timeSpent: number; // in minutes
  estimatedTime?: number; // in minutes
  parentId?: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface Bill {
  id: string;
  title: string;
  amount: number;
  currency: string;
  dueDate: Date;
  category: string;
  recurring: boolean;
  recurrence?: RecurrencePattern;
  paid: boolean;
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  date: Date;
  description?: string;
  tags: string[];
  createdAt: Date;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  currency: string;
  period: 'monthly' | 'yearly';
  spent: number;
  remaining: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  linkedTasks: string[];
  linkedEvents: string[];
  archived: boolean;
}

export interface PomodoroCategory {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PomodoroSession {
  id: string;
  taskId?: string;
  categoryId?: string;
  duration: number; // in minutes
  startTime: Date;
  endTime: Date;
  completed: boolean;
  notes?: string;
  type: 'work' | 'break' | 'long-break';
}

export interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  colorScheme: string;
  language: string;
  timeFormat: '12' | '24';
  currency: string;
  notifications: {
    tasks: boolean;
    bills: boolean;
    pomodoro: boolean;
    events: boolean;
  };
  pomodoro: PomodoroSettings;
}

export interface DashboardData {
  todayTasks: Task[];
  upcomingBills: Bill[];
  recentNotes: Note[];
  todayEvents: Event[];
  weeklyStats: {
    tasksCompleted: number;
    pomodoroSessions: number;
    expenseTotal: number;
    notesCreated: number;
  };
}

export type ViewType = 'dashboard' | 'calendar' | 'tasks' | 'finance' | 'notes' | 'pomodoro' | 'analytics' | 'settings';