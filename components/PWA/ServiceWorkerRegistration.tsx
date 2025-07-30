'use client'

import { useEffect } from 'react'

const ServiceWorkerRegistration = () => {
  useEffect(() => {
    // 检查浏览器是否支持Service Worker
    if ('serviceWorker' in navigator) {
      // 等待页面加载完成后注册Service Worker
      window.addEventListener('load', () => {
        registerServiceWorker()
      })
    } else {
      console.log('当前浏览器不支持Service Worker')
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('Service Worker注册成功:', registration.scope)

      // 监听Service Worker更新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          console.log('发现新的Service Worker')
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // 有新版本可用
                console.log('新版本可用，请刷新页面')
                showUpdateNotification()
              } else {
                // 首次安装完成
                console.log('Service Worker首次安装完成')
              }
            }
          })
        }
      })

      // 监听Service Worker控制器变化
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker控制器已更改')
        // 可以在这里刷新页面或显示通知
      })

      // 检查是否有等待中的Service Worker
      if (registration.waiting) {
        showUpdateNotification()
      }

    } catch (error) {
      console.error('Service Worker注册失败:', error)
    }
  }

  const showUpdateNotification = () => {
    // 创建更新通知
    const updateBanner = document.createElement('div')
    updateBanner.id = 'sw-update-banner'
    updateBanner.className = 'fixed top-0 left-0 right-0 bg-blue-600 text-white p-3 text-center z-50'
    updateBanner.innerHTML = `
      <div class="flex items-center justify-center space-x-4">
        <span>发现新版本，点击刷新页面获取最新功能</span>
        <button id="sw-update-btn" class="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100">
          刷新
        </button>
        <button id="sw-dismiss-btn" class="text-blue-200 hover:text-white">
          ✕
        </button>
      </div>
    `

    // 检查是否已经存在更新横幅
    const existingBanner = document.getElementById('sw-update-banner')
    if (existingBanner) {
      existingBanner.remove()
    }

    document.body.appendChild(updateBanner)

    // 添加事件监听器
    const updateBtn = document.getElementById('sw-update-btn')
    const dismissBtn = document.getElementById('sw-dismiss-btn')

    updateBtn?.addEventListener('click', () => {
      // 发送消息给Service Worker跳过等待
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
      }
      window.location.reload()
    })

    dismissBtn?.addEventListener('click', () => {
      updateBanner.remove()
    })

    // 5秒后自动隐藏
    setTimeout(() => {
      if (document.getElementById('sw-update-banner')) {
        updateBanner.remove()
      }
    }, 10000)
  }

  // 这个组件不渲染任何内容
  return null
}

export default ServiceWorkerRegistration