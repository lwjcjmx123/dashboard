import { gql } from '@apollo/client'

export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      completed
      priority
      dueDate
      createdAt
      updatedAt
      timeSpent
      estimatedTime
      tags {
        id
        name
      }
      subtasks {
        id
        title
        completed
        createdAt
      }
    }
  }
`

export const UPDATE_TASK = gql`
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) {
      id
      title
      description
      completed
      priority
      dueDate
      createdAt
      updatedAt
      timeSpent
      estimatedTime
      tags {
        id
        name
      }
      subtasks {
        id
        title
        completed
        createdAt
      }
    }
  }
`

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`

export const CREATE_EVENT = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      id
      title
      description
      startDate
      endDate
      category
      color
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_EVENT = gql`
  mutation UpdateEvent($input: UpdateEventInput!) {
    updateEvent(input: $input) {
      id
      title
      description
      startDate
      endDate
      category
      color
      createdAt
      updatedAt
    }
  }
`

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`

export const CREATE_BILL = gql`
  mutation CreateBill($input: CreateBillInput!) {
    createBill(input: $input) {
      id
      title
      amount
      currency
      dueDate
      category
      recurring
      paid
      paidDate
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_BILL = gql`
  mutation UpdateBill($input: UpdateBillInput!) {
    updateBill(input: $input) {
      id
      title
      amount
      currency
      dueDate
      category
      recurring
      paid
      paidDate
      createdAt
      updatedAt
    }
  }
`

export const DELETE_BILL = gql`
  mutation DeleteBill($id: ID!) {
    deleteBill(id: $id)
  }
`

export const CREATE_EXPENSE = gql`
  mutation CreateExpense($input: CreateExpenseInput!) {
    createExpense(input: $input) {
      id
      title
      amount
      currency
      category
      date
      description
      createdAt
      tags {
        id
        name
      }
    }
  }
`

export const DELETE_EXPENSE = gql`
  mutation DeleteExpense($id: ID!) {
    deleteExpense(id: $id)
  }
`

export const CREATE_NOTE = gql`
  mutation CreateNote($input: CreateNoteInput!) {
    createNote(input: $input) {
      id
      title
      content
      archived
      createdAt
      updatedAt
      tags {
        id
        name
      }
    }
  }
`

export const UPDATE_NOTE = gql`
  mutation UpdateNote($input: UpdateNoteInput!) {
    updateNote(input: $input) {
      id
      title
      content
      archived
      createdAt
      updatedAt
      tags {
        id
        name
      }
    }
  }
`

export const DELETE_NOTE = gql`
  mutation DeleteNote($id: ID!) {
    deleteNote(id: $id)
  }
`

export const CREATE_POMODORO_SESSION = gql`
  mutation CreatePomodoroSession($input: CreatePomodoroSessionInput!) {
    createPomodoroSession(input: $input) {
      id
      duration
      startTime
      endTime
      completed
      notes
      type
    }
  }
`

export const UPDATE_USER_SETTINGS = gql`
  mutation UpdateUserSettings($input: UpdateUserSettingsInput!) {
    updateUserSettings(input: $input) {
      id
      theme
      colorScheme
      language
      timeFormat
      currency
      notifyTasks
      notifyBills
      notifyPomodoro
      notifyEvents
      workDuration
      shortBreakDuration
      longBreakDuration
      sessionsUntilLongBreak
    }
  }
`