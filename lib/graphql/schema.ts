import { gql } from 'graphql-tag'

export const typeDefs = gql`
  scalar DateTime

  type User {
    id: ID!
    email: String!
    name: String
    createdAt: DateTime!
    updatedAt: DateTime!
    tasks: [Task!]!
    events: [Event!]!
    bills: [Bill!]!
    expenses: [Expense!]!
    notes: [Note!]!
    pomodoroSessions: [PomodoroSession!]!
    settings: UserSettings
  }

  type Task {
    id: ID!
    title: String!
    description: String
    completed: Boolean!
    priority: Priority!
    dueDate: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    timeSpent: Int!
    estimatedTime: Int
    parentId: String
    userId: String!
    tags: [TaskTag!]!
    subtasks: [SubTask!]!
    parent: Task
    children: [Task!]!
  }

  type SubTask {
    id: ID!
    title: String!
    completed: Boolean!
    createdAt: DateTime!
    taskId: String!
  }

  type TaskTag {
    id: ID!
    name: String!
    taskId: String!
  }

  type Event {
    id: ID!
    title: String!
    description: String
    startDate: DateTime!
    endDate: DateTime!
    category: EventCategory!
    color: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    userId: String!
    recurrence: RecurrencePattern
  }

  type RecurrencePattern {
    id: ID!
    frequency: RecurrenceFreq!
    interval: Int!
    endDate: DateTime
    count: Int
    eventId: String!
  }

  type Bill {
    id: ID!
    title: String!
    amount: Float!
    currency: String!
    dueDate: DateTime!
    category: String!
    recurring: Boolean!
    paid: Boolean!
    paidDate: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    userId: String!
  }

  type Expense {
    id: ID!
    title: String!
    amount: Float!
    currency: String!
    category: String!
    date: DateTime!
    description: String
    createdAt: DateTime!
    userId: String!
    tags: [ExpenseTag!]!
  }

  type ExpenseTag {
    id: ID!
    name: String!
    expenseId: String!
  }

  type Note {
    id: ID!
    title: String!
    content: String!
    archived: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    userId: String!
    tags: [NoteTag!]!
  }

  type NoteTag {
    id: ID!
    name: String!
    noteId: String!
  }

  type PomodoroSession {
    id: ID!
    duration: Int!
    startTime: DateTime!
    endTime: DateTime!
    completed: Boolean!
    notes: String
    type: SessionType!
    userId: String!
  }

  type UserSettings {
    id: ID!
    theme: String!
    colorScheme: String!
    language: String!
    timeFormat: String!
    currency: String!
    notifyTasks: Boolean!
    notifyBills: Boolean!
    notifyPomodoro: Boolean!
    notifyEvents: Boolean!
    workDuration: Int!
    shortBreakDuration: Int!
    longBreakDuration: Int!
    sessionsUntilLongBreak: Int!
    userId: String!
  }

  enum Priority {
    URGENT_IMPORTANT
    URGENT_NOT_IMPORTANT
    NOT_URGENT_IMPORTANT
    NOT_URGENT_NOT_IMPORTANT
  }

  enum EventCategory {
    TASK
    BILL
    NOTE
    POMODORO
    PERSONAL
  }

  enum RecurrenceFreq {
    DAILY
    WEEKLY
    MONTHLY
    YEARLY
  }

  enum SessionType {
    WORK
    BREAK
    LONG_BREAK
  }

  input CreateTaskInput {
    title: String!
    description: String
    priority: Priority!
    dueDate: DateTime
    estimatedTime: Int
    parentId: String
  }

  input UpdateTaskInput {
    id: ID!
    title: String
    description: String
    completed: Boolean
    priority: Priority
    dueDate: DateTime
    estimatedTime: Int
    timeSpent: Int
  }

  input CreateEventInput {
    title: String!
    description: String
    startDate: DateTime!
    endDate: DateTime!
    category: EventCategory!
    color: String
  }

  input UpdateEventInput {
    id: ID!
    title: String
    description: String
    startDate: DateTime
    endDate: DateTime
    category: EventCategory
    color: String
  }

  input CreateBillInput {
    title: String!
    amount: Float!
    currency: String
    dueDate: DateTime!
    category: String!
    recurring: Boolean
  }

  input UpdateBillInput {
    id: ID!
    title: String
    amount: Float
    currency: String
    dueDate: DateTime
    category: String
    recurring: Boolean
    paid: Boolean
    paidDate: DateTime
  }

  input CreateExpenseInput {
    title: String!
    amount: Float!
    currency: String
    category: String!
    date: DateTime!
    description: String
    tags: [String!]
  }

  input CreateNoteInput {
    title: String!
    content: String!
    tags: [String!]
  }

  input UpdateNoteInput {
    id: ID!
    title: String
    content: String
    archived: Boolean
    tags: [String!]
  }

  input CreatePomodoroSessionInput {
    duration: Int!
    startTime: DateTime!
    endTime: DateTime!
    completed: Boolean!
    notes: String
    type: SessionType!
  }

  input UpdateUserSettingsInput {
    theme: String
    colorScheme: String
    language: String
    timeFormat: String
    currency: String
    notifyTasks: Boolean
    notifyBills: Boolean
    notifyPomodoro: Boolean
    notifyEvents: Boolean
    workDuration: Int
    shortBreakDuration: Int
    longBreakDuration: Int
    sessionsUntilLongBreak: Int
  }

  type Query {
    me: User
    tasks: [Task!]!
    task(id: ID!): Task
    events: [Event!]!
    event(id: ID!): Event
    bills: [Bill!]!
    bill(id: ID!): Bill
    expenses: [Expense!]!
    expense(id: ID!): Expense
    notes: [Note!]!
    note(id: ID!): Note
    pomodoroSessions: [PomodoroSession!]!
    pomodoroSession(id: ID!): PomodoroSession
    userSettings: UserSettings
  }

  type Mutation {
    # Task mutations
    createTask(input: CreateTaskInput!): Task!
    updateTask(input: UpdateTaskInput!): Task!
    deleteTask(id: ID!): Boolean!

    # Event mutations
    createEvent(input: CreateEventInput!): Event!
    updateEvent(input: UpdateEventInput!): Event!
    deleteEvent(id: ID!): Boolean!

    # Bill mutations
    createBill(input: CreateBillInput!): Bill!
    updateBill(input: UpdateBillInput!): Bill!
    deleteBill(id: ID!): Boolean!

    # Expense mutations
    createExpense(input: CreateExpenseInput!): Expense!
    deleteExpense(id: ID!): Boolean!

    # Note mutations
    createNote(input: CreateNoteInput!): Note!
    updateNote(input: UpdateNoteInput!): Note!
    deleteNote(id: ID!): Boolean!

    # Pomodoro mutations
    createPomodoroSession(input: CreatePomodoroSessionInput!): PomodoroSession!

    # Settings mutations
    updateUserSettings(input: UpdateUserSettingsInput!): UserSettings!
  }
`