// Notification service for generating notifications based on tasks, bills, events, etc.

import { getDataAdapter } from './data-adapter';

interface NotificationData {
  title: string;
  message: string;
  type: string;
  taskId?: string;
  billId?: string;
  eventId?: string;
  userId: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private adapter: any;

  private constructor() {
    this.adapter = getDataAdapter();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async generateNotifications(userId: string = 'demo-user-id'): Promise<void> {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      // Check for due tasks
      await this.checkDueTasks(userId);
      
      // Check for due bills
      await this.checkDueBills(userId);
      
      // Check for upcoming events
      await this.checkUpcomingEvents(userId);
    } catch (error) {
      // Silent error handling
    }
  }

  private async checkDueTasks(userId: string): Promise<void> {
    try {
      const tasks = await this.adapter.task.findMany({
        where: { 
          userId,
          completed: false
        }
      });

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      for (const task of tasks) {
        if (!task.dueDate) continue;

        const dueDate = new Date(task.dueDate);
        const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

        // Check if notification already exists for this task
        const existingNotifications = await this.adapter.notification.findMany({
          where: {
            userId,
            taskId: task.id,
            type: 'TASK_DUE'
          }
        });

        if (existingNotifications && existingNotifications.length > 0) {
          continue; // Skip if notification already exists
        }

        // Task due today
        if (dueDateOnly.getTime() === today.getTime()) {
          await this.createNotification({
            title: '任务今日到期',
            message: `任务「${task.title}」今天到期`,
            type: 'TASK_DUE',
            taskId: task.id,
            userId
          });
        }
        // Task due tomorrow
        else if (dueDateOnly.getTime() === tomorrow.getTime()) {
          await this.createNotification({
            title: '任务明日到期',
            message: `任务「${task.title}」明天到期`,
            type: 'TASK_DUE',
            taskId: task.id,
            userId
          });
        }
        // Task overdue
        else if (dueDateOnly.getTime() < today.getTime()) {
          await this.createNotification({
            title: '任务已逾期',
            message: `任务「${task.title}」已逾期`,
            type: 'TASK_OVERDUE',
            taskId: task.id,
            userId
          });
        }
      }
    } catch (error) {
      // Silent error handling
    }
  }

  private async checkDueBills(userId: string): Promise<void> {
    try {
      const bills = await this.adapter.bill.findMany({
        where: { 
          userId,
          paid: false
        }
      });

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      for (const bill of bills) {
        if (!bill.dueDate) continue;

        const dueDate = new Date(bill.dueDate);
        const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

        // Check if notification already exists for this bill
        const existingNotifications = await this.adapter.notification.findMany({
          where: {
            userId,
            billId: bill.id,
            type: 'BILL_DUE'
          }
        });

        if (existingNotifications && existingNotifications.length > 0) {
          continue; // Skip if notification already exists
        }

        // Bill due today
        if (dueDateOnly.getTime() === today.getTime()) {
          await this.createNotification({
            title: '账单今日到期',
            message: `账单「${bill.title}」今天到期，金额：$${bill.amount}`,
            type: 'BILL_DUE',
            billId: bill.id,
            userId
          });
        }
        // Bill due tomorrow
        else if (dueDateOnly.getTime() === tomorrow.getTime()) {
          await this.createNotification({
            title: '账单明日到期',
            message: `账单「${bill.title}」明天到期，金额：$${bill.amount}`,
            type: 'BILL_DUE',
            billId: bill.id,
            userId
          });
        }
        // Bill overdue
        else if (dueDateOnly.getTime() < today.getTime()) {
          await this.createNotification({
            title: '账单已逾期',
            message: `账单「${bill.title}」已逾期，金额：$${bill.amount}`,
            type: 'BILL_OVERDUE',
            billId: bill.id,
            userId
          });
        }
      }
    } catch (error) {
      // Silent error handling
    }
  }

  private async checkUpcomingEvents(userId: string): Promise<void> {
    try {
      const events = await this.adapter.event.findMany({
        where: { userId }
      });

      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      for (const event of events) {
        if (!event.startDate) continue;

        const startDate = new Date(event.startDate);

        // Check if notification already exists for this event
        const existingNotifications = await this.adapter.notification.findMany({
          where: {
            userId,
            eventId: event.id,
            type: 'EVENT_REMINDER'
          }
        });

        if (existingNotifications && existingNotifications.length > 0) {
          continue; // Skip if notification already exists
        }

        // Event starting within 1 hour
        if (startDate.getTime() > now.getTime() && startDate.getTime() <= oneHourLater.getTime()) {
          await this.createNotification({
            title: '事件即将开始',
            message: `事件「${event.title}」将在1小时内开始`,
            type: 'EVENT_REMINDER',
            eventId: event.id,
            userId
          });
        }
        // Event starting tomorrow
        else if (startDate.getTime() > oneHourLater.getTime() && startDate.getTime() <= tomorrow.getTime()) {
          await this.createNotification({
            title: '明日事件提醒',
            message: `事件「${event.title}」明天开始`,
            type: 'EVENT_REMINDER',
            eventId: event.id,
            userId
          });
        }
      }
    } catch (error) {
      // Silent error handling
    }
  }

  private async createNotification(data: NotificationData): Promise<void> {
    try {
      // Check if notification already exists to avoid duplicates
      const existingNotifications = await this.adapter.notification.findMany({
        where: {
          userId: data.userId,
          type: data.type,
          taskId: data.taskId,
          billId: data.billId,
          eventId: data.eventId
        }
      });
      
      if (existingNotifications && existingNotifications.length > 0) {
        return;
      }
      
      await this.adapter.notification.create({
        data: {
          ...data,
          id: 'notification_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
          read: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      // Silent error handling
    }
  }

  // Method to manually trigger notification generation
  async triggerNotificationCheck(userId: string = 'demo-user-id'): Promise<void> {
    await this.generateNotifications(userId);
  }

  // Mark a single notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await this.adapter.notification.update({
        where: { id: notificationId },
        data: {
          read: true,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      // Silent error handling
    }
  }

  // Mark all notifications as read for a user
  async markAllNotificationsAsRead(userId: string = 'demo-user-id'): Promise<void> {
    try {
      const notifications = await this.adapter.notification.findMany({
        where: {
          userId,
          read: false
        }
      });

      for (const notification of notifications) {
        await this.adapter.notification.update({
          where: { id: notification.id },
          data: {
            read: true,
            updatedAt: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      // Silent error handling
    }
  }

  // Get notifications with option to hide read ones
  async getNotifications(userId: string = 'demo-user-id', hideRead: boolean = false): Promise<any[]> {
    try {
      const whereCondition: any = { userId };
      
      if (hideRead) {
        whereCondition.read = false;
      }

      const notifications = await this.adapter.notification.findMany({
        where: whereCondition,
        orderBy: {
          createdAt: 'desc'
        }
      });

      return notifications || [];
    } catch (error) {
      // Silent error handling
      return [];
    }
  }

  // Delete a notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await this.adapter.notification.delete({
        where: { id: notificationId }
      });
    } catch (error) {
      // Silent error handling
    }
  }

  // Delete all read notifications for a user
  async deleteReadNotifications(userId: string = 'demo-user-id'): Promise<void> {
    try {
      const readNotifications = await this.adapter.notification.findMany({
        where: {
          userId,
          read: true
        }
      });

      for (const notification of readNotifications) {
        await this.adapter.notification.delete({
          where: { id: notification.id }
        });
      }
    } catch (error) {
      // Silent error handling
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();