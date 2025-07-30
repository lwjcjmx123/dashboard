'use client'

import { LanguageProvider } from '@/contexts/LanguageContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import ServiceWorkerRegistration from '@/components/PWA/ServiceWorkerRegistration'
import PWAInstaller from '@/components/PWA/PWAInstaller'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <title>个人管理系统</title>
        <meta name="description" content="一个功能齐全的个人管理系统，包含任务管理、番茄钟、日历、分析和设置功能" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* PWA相关meta标签 */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="application-name" content="Personal Management System" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PMS" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* 图标 */}
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <link rel="icon" type="image/svg+xml" sizes="192x192" href="/icon-192.svg" />
        <link rel="icon" type="image/svg+xml" sizes="512x512" href="/icon-512.svg" />
        
        {/* 启动画面 */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-startup-image" href="/icon-512.svg" />
      </head>
      <body>
        <ServiceWorkerRegistration />
        <LanguageProvider>
          <ThemeProvider>
            {children}
            <PWAInstaller />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}