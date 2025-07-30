import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create demo user
  const user = await prisma.user.upsert({
    where: { id: 'demo-user' },
    update: {},
    create: {
      id: 'demo-user',
      email: 'demo@example.com',
      name: 'Demo User',
      settings: {
        create: {
          theme: 'light',
          colorScheme: 'blue',
          language: 'en',
          timeFormat: '24',
          currency: 'USD',
        },
      },
    },
  })

  // Create sample tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Complete project proposal',
        description: 'Finish the Q4 project proposal for the new client',
        priority: 'URGENT_IMPORTANT',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        userId: user.id,
      },
      {
        title: 'Review team performance',
        description: 'Conduct quarterly performance reviews',
        priority: 'NOT_URGENT_IMPORTANT',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        userId: user.id,
      },
      {
        title: 'Update website content',
        description: 'Update the about page with new team members',
        priority: 'URGENT_NOT_IMPORTANT',
        completed: true,
        userId: user.id,
      },
    ],
  })

  // Create sample bills
  await prisma.bill.createMany({
    data: [
      {
        title: 'Electricity Bill',
        amount: 120.50,
        category: 'Utilities',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        userId: user.id,
      },
      {
        title: 'Internet Service',
        amount: 79.99,
        category: 'Utilities',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
        recurring: true,
        userId: user.id,
      },
    ],
  })

  // Create sample expenses
  await prisma.expense.createMany({
    data: [
      {
        title: 'Coffee Shop',
        amount: 4.50,
        category: 'Food',
        date: new Date(),
        description: 'Morning coffee',
        userId: user.id,
      },
      {
        title: 'Gas Station',
        amount: 45.00,
        category: 'Transportation',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        userId: user.id,
      },
    ],
  })

  // Create sample notes
  await prisma.note.createMany({
    data: [
      {
        title: 'Meeting Notes - Q4 Planning',
        content: '# Q4 Planning Meeting\n\n## Key Points\n- Increase marketing budget by 20%\n- Launch new product line\n- Hire 3 new developers',
        userId: user.id,
      },
      {
        title: 'Book Recommendations',
        content: '# Books to Read\n\n1. **Atomic Habits** by James Clear\n2. **The Lean Startup** by Eric Ries\n3. **Deep Work** by Cal Newport',
        userId: user.id,
      },
    ],
  })

  // Create sample pomodoro sessions
  await prisma.pomodoroSession.createMany({
    data: [
      {
        duration: 25,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endTime: new Date(Date.now() - 95 * 60 * 1000), // 95 minutes ago
        completed: true,
        type: 'WORK',
        notes: 'Worked on project proposal',
        userId: user.id,
      },
      {
        duration: 5,
        startTime: new Date(Date.now() - 90 * 60 * 1000), // 90 minutes ago
        endTime: new Date(Date.now() - 85 * 60 * 1000), // 85 minutes ago
        completed: true,
        type: 'BREAK',
        userId: user.id,
      },
    ],
  })

  // Create sample notifications
  await prisma.notification.createMany({
    data: [
      {
        title: '任务提醒',
        message: '您有3个任务即将到期',
        type: 'TASK_DUE',
        read: false,
        userId: user.id,
        createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      },
      {
        title: '账单提醒',
        message: '电费账单将于明天到期',
        type: 'BILL_DUE',
        read: false,
        userId: user.id,
        createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      },
      {
        title: '番茄钟完成',
        message: '恭喜完成25分钟专注时间',
        type: 'POMODORO_COMPLETE',
        read: true,
        userId: user.id,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        title: '事件提醒',
        message: '团队会议将在30分钟后开始',
        type: 'EVENT_REMINDER',
        read: false,
        userId: user.id,
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      },
    ],
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })