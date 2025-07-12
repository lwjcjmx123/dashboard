import { prisma } from '../prisma'
import { GraphQLScalarType, Kind } from 'graphql'

// Custom DateTime scalar
const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Date custom scalar type',
  serialize(value: any) {
    return value instanceof Date ? value.toISOString() : value
  },
  parseValue(value: any) {
    return new Date(value)
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value)
    }
    return null
  },
})

// Mock user ID for demo purposes
const DEMO_USER_ID = 'demo-user'

export const resolvers = {
  DateTime: DateTimeScalar,

  Query: {
    me: async () => {
      let user = await prisma.user.findUnique({
        where: { id: DEMO_USER_ID },
        include: {
          tasks: { include: { tags: true, subtasks: true } },
          events: { include: { recurrence: true } },
          bills: true,
          expenses: { include: { tags: true } },
          notes: { include: { tags: true } },
          pomodoroSessions: true,
          settings: true,
        },
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            id: DEMO_USER_ID,
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
          include: {
            tasks: { include: { tags: true, subtasks: true } },
            events: { include: { recurrence: true } },
            bills: true,
            expenses: { include: { tags: true } },
            notes: { include: { tags: true } },
            pomodoroSessions: true,
            settings: true,
          },
        })
      }

      return user
    },

    tasks: async () => {
      return await prisma.task.findMany({
        where: { userId: DEMO_USER_ID },
        include: { tags: true, subtasks: true, children: true },
        orderBy: { createdAt: 'desc' },
      })
    },

    task: async (_: any, { id }: { id: string }) => {
      return await prisma.task.findUnique({
        where: { id },
        include: { tags: true, subtasks: true, children: true },
      })
    },

    events: async () => {
      return await prisma.event.findMany({
        where: { userId: DEMO_USER_ID },
        include: { recurrence: true },
        orderBy: { startDate: 'asc' },
      })
    },

    bills: async () => {
      return await prisma.bill.findMany({
        where: { userId: DEMO_USER_ID },
        orderBy: { dueDate: 'asc' },
      })
    },

    expenses: async () => {
      return await prisma.expense.findMany({
        where: { userId: DEMO_USER_ID },
        include: { tags: true },
        orderBy: { date: 'desc' },
      })
    },

    notes: async () => {
      return await prisma.note.findMany({
        where: { userId: DEMO_USER_ID },
        include: { tags: true },
        orderBy: { updatedAt: 'desc' },
      })
    },

    pomodoroSessions: async () => {
      return await prisma.pomodoroSession.findMany({
        where: { userId: DEMO_USER_ID },
        orderBy: { startTime: 'desc' },
      })
    },

    userSettings: async () => {
      return await prisma.userSettings.findUnique({
        where: { userId: DEMO_USER_ID },
      })
    },
  },

  Mutation: {
    createTask: async (_: any, { input }: { input: any }) => {
      const { tags, ...taskData } = input
      return await prisma.task.create({
        data: {
          ...taskData,
          userId: DEMO_USER_ID,
          tags: tags ? {
            create: tags.map((name: string) => ({ name }))
          } : undefined,
        },
        include: { tags: true, subtasks: true },
      })
    },

    updateTask: async (_: any, { input }: { input: any }) => {
      const { id, ...updateData } = input
      return await prisma.task.update({
        where: { id },
        data: updateData,
        include: { tags: true, subtasks: true },
      })
    },

    deleteTask: async (_: any, { id }: { id: string }) => {
      await prisma.task.delete({ where: { id } })
      return true
    },

    createEvent: async (_: any, { input }: { input: any }) => {
      return await prisma.event.create({
        data: {
          ...input,
          userId: DEMO_USER_ID,
        },
        include: { recurrence: true },
      })
    },

    updateEvent: async (_: any, { input }: { input: any }) => {
      const { id, ...updateData } = input
      return await prisma.event.update({
        where: { id },
        data: updateData,
        include: { recurrence: true },
      })
    },

    deleteEvent: async (_: any, { id }: { id: string }) => {
      await prisma.event.delete({ where: { id } })
      return true
    },

    createBill: async (_: any, { input }: { input: any }) => {
      return await prisma.bill.create({
        data: {
          ...input,
          userId: DEMO_USER_ID,
        },
      })
    },

    updateBill: async (_: any, { input }: { input: any }) => {
      const { id, ...updateData } = input
      return await prisma.bill.update({
        where: { id },
        data: updateData,
      })
    },

    deleteBill: async (_: any, { id }: { id: string }) => {
      await prisma.bill.delete({ where: { id } })
      return true
    },

    createExpense: async (_: any, { input }: { input: any }) => {
      const { tags, ...expenseData } = input
      return await prisma.expense.create({
        data: {
          ...expenseData,
          userId: DEMO_USER_ID,
          tags: tags ? {
            create: tags.map((name: string) => ({ name }))
          } : undefined,
        },
        include: { tags: true },
      })
    },

    deleteExpense: async (_: any, { id }: { id: string }) => {
      await prisma.expense.delete({ where: { id } })
      return true
    },

    createNote: async (_: any, { input }: { input: any }) => {
      const { tags, ...noteData } = input
      return await prisma.note.create({
        data: {
          ...noteData,
          userId: DEMO_USER_ID,
          tags: tags ? {
            create: tags.map((name: string) => ({ name }))
          } : undefined,
        },
        include: { tags: true },
      })
    },

    updateNote: async (_: any, { input }: { input: any }) => {
      const { id, tags, ...updateData } = input
      
      // If tags are provided, replace all tags
      if (tags) {
        await prisma.noteTags.deleteMany({ where: { noteId: id } })
        updateData.tags = {
          create: tags.map((name: string) => ({ name }))
        }
      }

      return await prisma.note.update({
        where: { id },
        data: updateData,
        include: { tags: true },
      })
    },

    deleteNote: async (_: any, { id }: { id: string }) => {
      await prisma.note.delete({ where: { id } })
      return true
    },

    createPomodoroSession: async (_: any, { input }: { input: any }) => {
      return await prisma.pomodoroSession.create({
        data: {
          ...input,
          userId: DEMO_USER_ID,
        },
      })
    },

    updateUserSettings: async (_: any, { input }: { input: any }) => {
      return await prisma.userSettings.upsert({
        where: { userId: DEMO_USER_ID },
        update: input,
        create: {
          ...input,
          userId: DEMO_USER_ID,
        },
      })
    },
  },
}