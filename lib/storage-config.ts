// Storage configuration for the application
// Controls whether to use database or IndexedDB for data persistence

export interface StorageConfig {
  useDatabase: boolean;
  databaseUrl?: string;
}

// Check if we're in a Vercel environment or if database URL is available
const isDatabaseAvailable = () => {
  // Check if we have a database URL in environment variables
  const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  
  // If no database URL is provided, use IndexedDB
  if (!databaseUrl) {
    return false;
  }
  
  // Additional checks can be added here (e.g., connection test)
  return true;
};

export const storageConfig: StorageConfig = {
  useDatabase: isDatabaseAvailable(),
  databaseUrl: process.env.DATABASE_URL || process.env.MYSQL_URL,
};

// Environment variable to force IndexedDB usage (useful for testing)
if (process.env.FORCE_INDEXEDDB === 'true') {
  storageConfig.useDatabase = false;
}

// Storage configuration loaded