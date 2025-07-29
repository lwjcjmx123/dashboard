import { getDataAdapter } from '../data-adapter'
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
      const dataAdapter = getDataAdapter()
      let user = await dataAdapter.user.findUnique({
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
        user = await dataAdapter.user.create({
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
      const dataAdapter = getDataAdapter()
      return await dataAdapter.task.findMany({
        where: { userId: DEMO_USER_ID },
        include: { tags: true, subtasks: true, children: true },
        orderBy: { createdAt: 'desc' },
      })
    },

    task: async (_: any, { id }: { id: string }) => {
      const dataAdapter = getDataAdapter()
      return await dataAdapter.task.findUnique({
        where: { id },
        include: { tags: true, subtasks: true, children: true },
      })
    },

    events: async () => {
      const dataAdapter = getDataAdapter()
      return await dataAdapter.event.findMany({
        where: { userId: DEMO_USER_ID },
        include: { recurrence: true },
        orderBy: { startDate: 'asc' },
      })
    },

    bills: async () => {
      const dataAdapter = getDataAdapter()
      return await dataAdapter.bill.findMany({
        where: { userId: DEMO_USER_ID },
        orderBy: { dueDate: 'asc' },
      })
    },

    expenses: async () => {
      const dataAdapter = getDataAdapter()
      return await dataAdapter.expense.findMany({
        where: { userId: DEMO_USER_ID },
        include: { tags: true },
        orderBy: { date: 'desc' },
      })
    },

    notes: async () => {
      const dataAdapter = getDataAdapter()
      return await dataAdapter.note.findMany({
        where: { userId: DEMO_USER_ID },
        include: { tags: true },
        orderBy: { updatedAt: 'desc' },
      })
    },

    pomodoroSessions: async () => {
      const dataAdapter = getDataAdapter()
      return await dataAdapter.pomodoroSession.findMany({
        where: { userId: DEMO_USER_ID },
        orderBy: { startTime: 'desc' },
      })
    },

    userSettings: async () => {
      const dataAdapter = getDataAdapter()
      return await dataAdapter.userSettings.findUnique({
        where: { userId: DEMO_USER_ID },
      })
    },
  },

  Mutation: {
    createTask: async (_: any, { input }: { input: any }) => {
      const dataAdapter = getDataAdapter()
      const { tags, ...taskData } = input
      return await dataAdapter.task.create({
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
      const dataAdapter = getDataAdapter()
      const { id, ...updateData } = input
      return await dataAdapter.task.update({
        where: { id },
        data: updateData,
        include: { tags: true, subtasks: true },
      })
    },

    deleteTask: async (_: any, { id }: { id: string }) => {
      const dataAdapter = getDataAdapter()
      await dataAdapter.task.delete({ where: { id } })
      return true
    },

    createEvent: async (_: any, { input }: { input: any }) => {
      const dataAdapter = getDataAdapter()
      return await dataAdapter.event.create({
        data: {
          ...input,
          userId: DEMO_USER_ID,
        },
        include: { recurrence: true },
      })
    },

    updateEvent: async (_: any, { input }: { input: any }) => {
      const dataAdapter = getDataAdapter()
      const { id, ...updateData } = input
      return await dataAdapter.event.update({
        where: { id },
        data: updateData,
        include: { recurrence: true },
      })
    },

    deleteEvent: async (_: any, { id }: { id: string }) => {
      const dataAdapter = getDataAdapter()
      await dataAdapter.event.delete({ where: { id } })
      return true
    },

    createBill: async (_: any, { input }: { input: any }) => {
      const dataAdapter = getDataAdapter()
      return await dataAdapter.bill.create({
        data: {
          ...input,
          userId: DEMO_USER_ID,
        },
      })
    },

    updateBill: async (_: any, { input }: { input: any }) => {
      const dataAdapter = getDataAdapter()
      const { id, ...updateData } = input
      return await dataAdapter.bill.update({
        where: { id },
        data: updateData,
      })
    },

    deleteBill: async (_: any, { id }: { id: string }) => {
      const dataAdapter = getDataAdapter()
      await dataAdapter.bill.delete({ where: { id } })
      return true
    },

    createExpense: async (_: any, { input }: { input: any }) => {
      const dataAdapter = getDataAdapter()
      const { tags, ...expenseData } = input
      return await dataAdapter.expense.create({
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
      const dataAdapter = getDataAdapter()
      await dataAdapter.expense.delete({ where: { id } })
      return true
    },

    createNote: async (_: any, { input }: { input: any }) => {
      const dataAdapter = getDataAdapter()
      const { tags, ...noteData } = input
      return await dataAdapter.note.create({
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
      const dataAdapter = getDataAdapter()
      const { id, tags, ...updateData } = input
      
      // Note: For IndexedDB, we'll handle tags differently
      // This is a simplified version that works with both adapters
      return await dataAdapter.note.update({
        where: { id },
        data: { ...updateData, tags },
        include: { tags: true },
      })
    },

    deleteNote: async (_: any, { id }: { id: string }) => {
      const dataAdapter = getDataAdapter()
      await dataAdapter.note.delete({ where: { id } })
      return true
    },

    createPomodoroSession: async (_: any, { input }: { input: any }) => {
      const dataAdapter = getDataAdapter()
      return await dataAdapter.pomodoroSession.create({
        data: {
          ...input,
          userId: DEMO_USER_ID,
        },
      })
    },

    updateUserSettings: async (_: any, { input }: { input: any }) => {
      const dataAdapter = getDataAdapter()
      return await dataAdapter.userSettings.upsert({
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