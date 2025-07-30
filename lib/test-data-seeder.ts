// Test data seeder for IndexedDB to test notification generation

import { getDataAdapter } from "./data-adapter";

export const seedTestData = async () => {
  try {
    const adapter = getDataAdapter();
    const userId = "demo-user-id";

    // Create a task due today
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    const todayTask = {
      id: "task_today_" + Date.now(),
      title: "完成项目报告",
      description: "需要在今天完成季度项目报告",
      completed: false,
      priority: "URGENT_IMPORTANT",
      dueDate: today.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeSpent: 0,
      estimatedTime: 120,
      userId,
    };

    // Create a task due tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const tomorrowTask = {
      id: "task_tomorrow_" + Date.now(),
      title: "准备会议材料",
      description: "为明天的团队会议准备相关材料",
      completed: false,
      priority: "NOT_URGENT_IMPORTANT",
      dueDate: tomorrow.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeSpent: 0,
      estimatedTime: 60,
      userId,
    };

    // Create an overdue task
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    const overdueTask = {
      id: "task_overdue_" + Date.now(),
      title: "回复客户邮件",
      description: "回复重要客户的询问邮件",
      completed: false,
      priority: "URGENT_IMPORTANT",
      dueDate: yesterday.toISOString(),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      timeSpent: 0,
      estimatedTime: 30,
      userId,
    };

    // Create a bill due today
    const todayBill = {
      id: "bill_today_" + Date.now(),
      title: "电费账单",
      amount: 89.5,
      currency: "USD",
      dueDate: today.toISOString(),
      category: "Utilities",
      recurring: true,
      paid: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId,
    };

    // Create an event starting in 30 minutes
    const soonEvent = new Date();
    soonEvent.setMinutes(soonEvent.getMinutes() + 30);

    const upcomingEvent = {
      id: "event_soon_" + Date.now(),
      title: "团队站会",
      description: "每日团队同步会议",
      startDate: soonEvent.toISOString(),
      endDate: new Date(soonEvent.getTime() + 30 * 60 * 1000).toISOString(),
      category: "MEETING",
      color: "#3b82f6",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId,
    };

    // Add the test data
    await adapter.task.create({ data: todayTask });
    await adapter.task.create({ data: tomorrowTask });
    await adapter.task.create({ data: overdueTask });
    await adapter.bill.create({ data: todayBill });
    await adapter.event.create({ data: upcomingEvent });

    console.log("Test data seeded successfully!");
    console.log("Created tasks:", [
      todayTask.title,
      tomorrowTask.title,
      overdueTask.title,
    ]);
    console.log("Created bill:", todayBill.title);
    console.log("Created event:", upcomingEvent.title);
  } catch (error) {
    console.error("Error seeding test data:", error);
  }
};

// Function to clear test data
export const clearTestData = async () => {
  try {
    const adapter = getDataAdapter();

    // Get all tasks, bills, events, and notifications for demo user
    const tasks = await adapter.task.findMany({
      where: { userId: "demo-user-id" },
    });
    const bills = await adapter.bill.findMany({
      where: { userId: "demo-user-id" },
    });
    const events = await adapter.event.findMany({
      where: { userId: "demo-user-id" },
    });
    const notifications = await adapter.notification.findMany({
      where: { userId: "demo-user-id" },
    });

    // Delete all test data
    for (const task of tasks) {
      await adapter.task.delete({ where: { id: task.id } });
    }

    for (const bill of bills) {
      await adapter.bill.delete({ where: { id: bill.id } });
    }

    for (const event of events) {
      await adapter.event.delete({ where: { id: event.id } });
    }

    for (const notification of notifications) {
      await adapter.notification.delete({ where: { id: notification.id } });
    }

    console.log("Test data cleared successfully!");
  } catch (error) {
    console.error("Error clearing test data:", error);
  }
};
