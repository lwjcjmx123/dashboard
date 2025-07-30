// Service Worker for Personal Management System PWA
const CACHE_NAME = 'pms-v1.0.0'
const STATIC_CACHE_NAME = 'pms-static-v1.0.0'
const DYNAMIC_CACHE_NAME = 'pms-dynamic-v1.0.0'

// 静态资源缓存列表
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/calendar',
  '/tasks',
  '/finance',
  '/notes',
  '/pomodoro',
  '/analytics',
  '/settings',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
  '/icon.svg'
]

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker: Static assets cached')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static assets:', error)
      })
  )
})

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Activated')
        return self.clients.claim()
      })
  )
})

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 跳过非HTTP请求
  if (!request.url.startsWith('http')) {
    return
  }

  // 跳过Chrome扩展请求
  if (url.protocol === 'chrome-extension:') {
    return
  }

  // 对于导航请求，使用网络优先策略
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 如果网络请求成功，缓存响应
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone)
              })
          }
          return response
        })
        .catch(() => {
          // 网络失败时，从缓存中获取
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse
              }
              // 如果缓存中也没有，返回离线页面
              return caches.match('/')
            })
        })
    )
    return
  }

  // 对于其他请求，使用缓存优先策略
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        // 如果缓存中没有，从网络获取
        return fetch(request)
          .then((response) => {
            // 只缓存成功的响应
            if (response.status === 200 && response.type === 'basic') {
              const responseClone = response.clone()
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone)
                })
            }
            return response
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed:', error)
            // 对于图片等资源，可以返回默认资源
            if (request.destination === 'image') {
              return caches.match('/icon-192.svg')
            }
            throw error
          })
      })
  )
})

// 处理消息事件
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})

// 后台同步事件（如果支持）
if ('sync' in self.registration) {
  self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered:', event.tag)
    
    if (event.tag === 'background-sync') {
      event.waitUntil(
        // 这里可以添加后台同步逻辑
        Promise.resolve()
      )
    }
  })
}

// 推送通知事件（如果需要）
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received')
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from PMS',
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icon-192.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192.svg'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('Personal Management System', options)
  )
})

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked')
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})