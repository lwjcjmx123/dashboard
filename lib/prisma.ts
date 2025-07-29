import { PrismaClient } from '@prisma/client'
import { storageConfig } from './storage-config'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Only create Prisma client if database is configured
let prisma: PrismaClient | null = null

if (storageConfig.useDatabase) {
  try {
    prisma = globalForPrisma.prisma ?? new PrismaClient()
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma
    }
  } catch (error) {
    console.warn('Failed to initialize Prisma client:', error)
    prisma = null
  }
}

export { prisma }