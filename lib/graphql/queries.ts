import { gql } from '@apollo/client'

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
      createdAt
      updatedAt
      settings {
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
  }
`

export const GET_TASKS = gql`
  query GetTasks {
    tasks {
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
      parentId
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

export const GET_EVENTS = gql`
  query GetEvents {
    events {
      id
      title
      description
      startDate
      endDate
      category
      color
      createdAt
      updatedAt
      recurrence {
        id
        frequency
        interval
        endDate
        count
      }
    }
  }
`

export const GET_BILLS = gql`
  query GetBills {
    bills {
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

export const GET_EXPENSES = gql`
  query GetExpenses {
    expenses {
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

export const GET_NOTES = gql`
  query GetNotes {
    notes {
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

export const GET_POMODORO_SESSIONS = gql`
  query GetPomodoroSessions {
    pomodoroSessions {
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

export const GET_USER_SETTINGS = gql`
  query GetUserSettings {
    userSettings {
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