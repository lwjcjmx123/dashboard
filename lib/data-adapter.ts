// Unified data access layer that switches between Prisma and IndexedDB

import { storageConfig } from './storage-config';
import { getIndexedDBAdapter } from './indexeddb-adapter';

// Define the interface that both adapters should implement
interface DataAdapter {
  user: {
    findUnique: (options: any) => Promise<any>;
    create: (options: any) => Promise<any>;
    update: (options: any) => Promise<any>;
    upsert: (options: any) => Promise<any>;
  };
  task: {
    findMany: (options?: any) => Promise<any[]>;
    findUnique: (options: any) => Promise<any>;
    create: (options: any) => Promise<any>;
    update: (options: any) => Promise<any>;
    delete: (options: any) => Promise<any>;
  };
  event: {
    findMany: (options?: any) => Promise<any[]>;
    create: (options: any) => Promise<any>;
    update: (options: any) => Promise<any>;
    delete: (options: any) => Promise<any>;
  };
  bill: {
    findMany: (options?: any) => Promise<any[]>;
    create: (options: any) => Promise<any>;
    update: (options: any) => Promise<any>;
    delete: (options: any) => Promise<any>;
  };
  expense: {
    findMany: (options?: any) => Promise<any[]>;
    create: (options: any) => Promise<any>;
    update: (options: any) => Promise<any>;
    delete: (options: any) => Promise<any>;
  };
  note: {
    findMany: (options?: any) => Promise<any[]>;
    create: (options: any) => Promise<any>;
    update: (options: any) => Promise<any>;
    delete: (options: any) => Promise<any>;
  };
  pomodoroSession: {
    findMany: (options?: any) => Promise<any[]>;
    create: (options: any) => Promise<any>;
  };
  userSettings: {
    findUnique: (options: any) => Promise<any>;
    upsert: (options: any) => Promise<any>;
  };
}

// IndexedDB adapter implementation
class IndexedDBDataAdapter implements DataAdapter {
  private adapter: any = null;

  private async getAdapter() {
    if (!this.adapter) {
      if (typeof window === 'undefined') {
        throw new Error('IndexedDB is only available in browser environment');
      }
      this.adapter = getIndexedDBAdapter();
      await this.adapter.init();
    }
    return this.adapter;
  }

  user = {
    findUnique: async (options: any) => {
      const adapter = await this.getAdapter();
      return adapter.findUnique('users', options.where);
    },
    create: async (options: any) => {
      const adapter = await this.getAdapter();
      return adapter.create('users', options);
    },
    update: async (options: any) => {
      const adapter = await this.getAdapter();
      return adapter.update('users', options);
    },
    upsert: async (options: any) => {
      const adapter = await this.getAdapter();
      return adapter.upsert('users', options);
    },
  };

  task = {
    findMany: async (options?: any) => {
      const adapter = await this.getAdapter();
      return adapter.findMany('tasks', options);
    },
    findUnique: async (options: any) => {
      const adapter = await this.getAdapter();
      return adapter.findUnique('tasks', options.where);
    },
    create: async (options: any) => {
      const adapter = await this.getAdapter();
      return adapter.create('tasks', options);
    },
    update: async (options: any) => {
      const adapter = await this.getAdapter();
      return adapter.update('tasks', options);
    },
    delete: async (options: any) => {
      const adapter = await this.getAdapter();
      return adapter.delete('tasks', options.where);
    },
  };

  event = {
    findMany: async (options?: any) => {
      const adapter = await this.getAdapter();
      return adapter.findMany('events', options);
    },
    create: async (options: any) => {
      const adapter = await this.getAdapter();
      return adapter.create('events', options);
    },
    update: async (options: any) => {
      const adapter = await this.getAdapter();
      return adapter.update('events', options);
    },
    delete: async (options: any) => {
      const adapter = await this.getAdapter();
      return adapter.delete('events', options.where);
    },
  };

  bill = {
    findMany: async (options?: any) => {
      const adapter = await this.getAdapter();
      return adapter.findMany('bills', options);
    },
    create: async (options: any) => {
      const adapter = await this.getAdapter();
      return adapter.create('bills', options);
    },
    update: async (options: any) => {
      const adapter = await this.getAdapter();
      return adapter.update('bills', options);
    },
    delete: async (options: any) => {
      const adapter = await this.getAdapter();
      return adapter.delete('bills', options.where);
    },
  };

  expense = {
    findMany: async (options?: any) => {
      const adapter = await this.getAdapter();
      return adapter.findMany('expenses', options);
    },
    create: async (options: any) => {
      const adapter = await this.getAdapter();
      return adapter.create('expenses', options);
    },
    update: async (options: any) => {
      const adapter = await this.getAdapter();
      return adapter.update('expenses', options);
    },
    delete: async (options: any) => {
      const adapter = await this.getAdapter();
      return adapter.delete('expenses', options.where);
    },
  };

  note = {
    findMany: async (options?: any) => {
      const adapter = await this.getAdapter();
      return adapter.findMany('notes', options);
    },
    create: async (options: any) => {
      const adapter = await this.getAdapter();
      return adapter.create('notes', options);
    },
    update: async (options: any) => {
      const adapter = await this.getAdapter();
      return adapter.update('notes', options);
    },
    delete: async (options: any) => {
      const adapter = await this.getAdapter();
      return adapter.delete('notes', options.where);
    },
  };

  pomodoroSession = {
    findMany: async (options?: any) => {
      const adapter = await this.getAdapter();
      return adapter.findMany('pomodoroSessions', options);
    },
    create: async (options: any) => {
      const adapter = await this.getAdapter();
      return adapter.create('pomodoroSessions', options);
    },
  };

  userSettings = {
    findUnique: async (options: any) => {
      const adapter = await this.getAdapter();
      return adapter.findUnique('userSettings', options.where);
    },
    upsert: async (options: any) => {
      const adapter = await this.getAdapter();
      return adapter.upsert('userSettings', options);
    },
  };
}

// No-op adapter for server-side rendering without database
class NoOpDataAdapter implements DataAdapter {
  private generateMockUser() {
    return {
      id: 'mock-user-id',
      email: 'user@example.com',
      name: 'Mock User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [],
      events: [],
      bills: [],
      expenses: [],
      notes: [],
      pomodoroSessions: [],
      settings: null
    };
  }

  private generateMockTask() {
    return {
      id: 'mock-task-id',
      title: 'Mock Task',
      description: '',
      completed: false,
      priority: 'NOT_URGENT_NOT_IMPORTANT',
      dueDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeSpent: 0,
      estimatedTime: null,
      parentId: null,
      userId: 'mock-user-id',
      tags: [],
      subtasks: [],
      parent: null,
      children: []
    };
  }

  private generateMockEvent() {
    return {
      id: 'mock-event-id',
      title: 'Mock Event',
      description: '',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      category: 'PERSONAL',
      color: '#3B82F6',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'mock-user-id',
      recurrence: null
    };
  }

  private generateMockBill() {
    return {
      id: 'mock-bill-id',
      title: 'Mock Bill',
      amount: 0,
      currency: 'USD',
      dueDate: new Date().toISOString(),
      category: 'Utilities',
      recurring: false,
      paid: false,
      paidDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'mock-user-id'
    };
  }

  private generateMockExpense() {
    return {
      id: 'mock-expense-id',
      title: 'Mock Expense',
      amount: 0,
      currency: 'USD',
      category: 'Other',
      date: new Date().toISOString(),
      description: '',
      createdAt: new Date().toISOString(),
      userId: 'mock-user-id',
      tags: []
    };
  }

  private generateMockNote() {
    return {
      id: 'mock-note-id',
      title: 'Mock Note',
      content: '',
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'mock-user-id',
      tags: []
    };
  }

  private generateMockPomodoroSession() {
    return {
      id: 'mock-pomodoro-id',
      duration: 25,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      completed: false,
      notes: '',
      type: 'WORK',
      userId: 'mock-user-id'
    };
  }

  private generateMockUserSettings() {
    return {
      id: 'mock-settings-id',
      theme: 'light',
      colorScheme: 'blue',
      language: 'en',
      timeFormat: '24h',
      currency: 'USD',
      notifyTasks: true,
      notifyBills: true,
      notifyPomodoro: true,
      notifyEvents: true,
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4,
      userId: 'mock-user-id'
    };
  }

  user = {
    findUnique: async () => this.generateMockUser(),
    create: async () => this.generateMockUser(),
    update: async () => this.generateMockUser(),
    upsert: async () => this.generateMockUser(),
  };

  task = {
    findMany: async () => [],
    findUnique: async () => this.generateMockTask(),
    create: async () => this.generateMockTask(),
    update: async () => this.generateMockTask(),
    delete: async () => this.generateMockTask(),
  };

  event = {
    findMany: async () => [],
    findUnique: async () => this.generateMockEvent(),
    create: async () => this.generateMockEvent(),
    update: async () => this.generateMockEvent(),
    delete: async () => this.generateMockEvent(),
  };

  bill = {
    findMany: async () => [],
    findUnique: async () => this.generateMockBill(),
    create: async () => this.generateMockBill(),
    update: async () => this.generateMockBill(),
    delete: async () => this.generateMockBill(),
  };

  expense = {
    findMany: async () => [],
    findUnique: async () => this.generateMockExpense(),
    create: async () => this.generateMockExpense(),
    update: async () => this.generateMockExpense(),
    delete: async () => this.generateMockExpense(),
  };

  note = {
    findMany: async () => [],
    findUnique: async () => this.generateMockNote(),
    create: async () => this.generateMockNote(),
    update: async () => this.generateMockNote(),
    delete: async () => this.generateMockNote(),
  };

  pomodoroSession = {
    findMany: async () => [],
    findUnique: async () => this.generateMockPomodoroSession(),
    create: async () => this.generateMockPomodoroSession(),
    update: async () => this.generateMockPomodoroSession(),
    delete: async () => this.generateMockPomodoroSession(),
  };

  userSettings = {
    findUnique: async () => this.generateMockUserSettings(),
    create: async () => this.generateMockUserSettings(),
    update: async () => this.generateMockUserSettings(),
    upsert: async () => this.generateMockUserSettings(),
  };
}

// Prisma adapter implementation (wrapper around existing prisma client)
class PrismaDataAdapter implements DataAdapter {
  private prisma: any;

  constructor() {
    // Dynamically import prisma only when needed
    if (typeof window === 'undefined') {
      // Server-side
      try {
        const { prisma } = require('./prisma');
        if (!prisma) {
          throw new Error('Prisma client not initialized');
        }
        this.prisma = prisma;
      } catch (error) {
        console.warn('Prisma not available, falling back to IndexedDB');
        throw new Error('Prisma not available');
      }
    } else {
      // Client-side - Prisma not available
      throw new Error('Prisma not available on client-side');
    }
  }

  user = {
    findUnique: (options: any) => this.prisma.user.findUnique(options),
    create: (options: any) => this.prisma.user.create(options),
    update: (options: any) => this.prisma.user.update(options),
    upsert: (options: any) => this.prisma.user.upsert(options),
  };

  task = {
    findMany: (options?: any) => this.prisma.task.findMany(options),
    findUnique: (options: any) => this.prisma.task.findUnique(options),
    create: (options: any) => this.prisma.task.create(options),
    update: (options: any) => this.prisma.task.update(options),
    delete: (options: any) => this.prisma.task.delete(options),
  };

  event = {
    findMany: (options?: any) => this.prisma.event.findMany(options),
    create: (options: any) => this.prisma.event.create(options),
    update: (options: any) => this.prisma.event.update(options),
    delete: (options: any) => this.prisma.event.delete(options),
  };

  bill = {
    findMany: (options?: any) => this.prisma.bill.findMany(options),
    create: (options: any) => this.prisma.bill.create(options),
    update: (options: any) => this.prisma.bill.update(options),
    delete: (options: any) => this.prisma.bill.delete(options),
  };

  expense = {
    findMany: (options?: any) => this.prisma.expense.findMany(options),
    create: (options: any) => this.prisma.expense.create(options),
    update: (options: any) => this.prisma.expense.update(options),
    delete: (options: any) => this.prisma.expense.delete(options),
  };

  note = {
    findMany: (options?: any) => this.prisma.note.findMany(options),
    create: (options: any) => this.prisma.note.create(options),
    update: (options: any) => this.prisma.note.update(options),
    delete: (options: any) => this.prisma.note.delete(options),
  };

  pomodoroSession = {
    findMany: (options?: any) => this.prisma.pomodoroSession.findMany(options),
    create: (options: any) => this.prisma.pomodoroSession.create(options),
  };

  userSettings = {
    findUnique: (options: any) => this.prisma.userSettings.findUnique(options),
    upsert: (options: any) => this.prisma.userSettings.upsert(options),
  };
}

// Factory function to get the appropriate data adapter
let serverDataAdapterInstance: DataAdapter | null = null;
let clientDataAdapterInstance: DataAdapter | null = null;

export const getDataAdapter = (): DataAdapter => {
  const isServer = typeof window === 'undefined';
  
  // Use separate instances for server and client
  if (isServer && serverDataAdapterInstance) {
    return serverDataAdapterInstance;
  }
  if (!isServer && clientDataAdapterInstance) {
    return clientDataAdapterInstance;
  }

  try {
    if (storageConfig.useDatabase && isServer) {
      // Server-side with database
      serverDataAdapterInstance = new PrismaDataAdapter();
      console.log('Using Prisma data adapter');
      return serverDataAdapterInstance;
    } else if (!isServer) {
      // Client-side - use IndexedDB
      clientDataAdapterInstance = new IndexedDBDataAdapter();
      console.log('Using IndexedDB data adapter');
      return clientDataAdapterInstance;
    } else {
      // Server-side without database - use no-op adapter
      serverDataAdapterInstance = new NoOpDataAdapter();
      console.log('Using No-op data adapter (server-side without database)');
      return serverDataAdapterInstance;
    }
  } catch (error) {
    if (!isServer) {
      // Client-side fallback to IndexedDB
      console.warn('Falling back to IndexedDB:', error);
      clientDataAdapterInstance = new IndexedDBDataAdapter();
      return clientDataAdapterInstance;
    } else {
      // Server-side - re-throw the error
      throw error;
    }
  }
};

export type { DataAdapter };