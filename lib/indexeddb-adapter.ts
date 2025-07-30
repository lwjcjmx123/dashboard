// IndexedDB adapter that mimics Prisma API for client-side storage

interface DBSchema {
  users: any;
  tasks: any;
  events: any;
  bills: any;
  expenses: any;
  notes: any;
  pomodoroSessions: any;
  userSettings: any;
}

class IndexedDBAdapter {
  private dbName = 'dashboard-app';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('IndexedDB is only available in browser environment');
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        const stores = ['users', 'tasks', 'events', 'bills', 'expenses', 'notes', 'pomodoroSessions', 'userSettings'];
        
        stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' });
            
            // Create indexes for common queries
            if (storeName !== 'users' && storeName !== 'userSettings') {
              store.createIndex('userId', 'userId', { unique: false });
            }
            if (storeName === 'tasks') {
              store.createIndex('completed', 'completed', { unique: false });
              store.createIndex('dueDate', 'dueDate', { unique: false });
            }
            if (storeName === 'events') {
              store.createIndex('startDate', 'startDate', { unique: false });
            }
            if (storeName === 'bills') {
              store.createIndex('dueDate', 'dueDate', { unique: false });
            }
          }
        });
      };
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (!this.db) {
      await this.init();
    }
    const transaction = this.db!.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  private generateId(): string {
    return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Generic CRUD operations
  async findUnique<T>(storeName: string, where: any): Promise<T | null> {
    const store = await this.getStore(storeName);
    
    // Special handling for userSettings which queries by userId
    if (storeName === 'userSettings' && where.userId) {
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const results = request.result || [];
          const found = results.find(item => item.userId === where.userId);
          resolve(found || null);
        };
        request.onerror = () => reject(request.error);
      });
    }
    
    // Default behavior for id-based queries
    return new Promise((resolve, reject) => {
      const request = store.get(where.id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async findMany<T>(storeName: string, options?: {
    where?: any;
    orderBy?: any;
    include?: any;
  }): Promise<T[]> {
    const store = await this.getStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        let results = request.result || [];
        
        // Apply where filter
        if (options?.where) {
          results = results.filter(item => {
            return Object.entries(options.where).every(([key, value]) => {
              return item[key] === value;
            });
          });
        }
        
        // Apply ordering
        if (options?.orderBy) {
          const [field, direction] = Object.entries(options.orderBy)[0];
          results.sort((a, b) => {
            const aVal = a[field as string];
            const bVal = b[field as string];
            if (direction === 'desc') {
              return bVal > aVal ? 1 : -1;
            }
            return aVal > bVal ? 1 : -1;
          });
        }
        
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async create<T>(storeName: string, data: { data: any }): Promise<T> {
    const store = await this.getStore(storeName, 'readwrite');
    const item = {
      ...data.data,
      id: data.data.id || this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return new Promise((resolve, reject) => {
      const request = store.add(item);
      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  }

  async update<T>(storeName: string, options: { where: { id: string }; data: any }): Promise<T> {
    const store = await this.getStore(storeName, 'readwrite');
    
    return new Promise(async (resolve, reject) => {
      // First get the existing item
      const getRequest = store.get(options.where.id);
      getRequest.onsuccess = () => {
        const existingItem = getRequest.result;
        if (!existingItem) {
          reject(new Error('Item not found'));
          return;
        }
        
        const updatedItem = {
          ...existingItem,
          ...options.data,
          updatedAt: new Date(),
        };
        
        const putRequest = store.put(updatedItem);
        putRequest.onsuccess = () => resolve(updatedItem);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async delete(storeName: string, where: { id: string }): Promise<any> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(where.id);
      request.onsuccess = () => resolve({ id: where.id });
      request.onerror = () => reject(request.error);
    });
  }

  async upsert<T>(storeName: string, options: {
    where: any;
    create: any;
    update: any;
  }): Promise<T> {
    try {
      const existing = await this.findUnique(storeName, options.where);
      if (existing) {
        // For userSettings, use the existing id for update
        const whereClause = storeName === 'userSettings' && options.where.userId 
          ? { id: (existing as any).id }
          : options.where;
        return await this.update(storeName, {
          where: whereClause,
          data: options.update,
        });
      } else {
        // For userSettings, generate an id if not provided
        const createData = storeName === 'userSettings' && options.where.userId
          ? { ...options.create, id: this.generateId() }
          : { ...options.create, id: options.where.id || this.generateId() };
        return await this.create(storeName, {
          data: createData,
        });
      }
    } catch (error) {
      throw error;
    }
  }
}

// Create a singleton instance
let indexedDBAdapter: IndexedDBAdapter | null = null;

export const getIndexedDBAdapter = (): IndexedDBAdapter => {
  if (!indexedDBAdapter) {
    indexedDBAdapter = new IndexedDBAdapter();
  }
  return indexedDBAdapter;
};

export { IndexedDBAdapter };