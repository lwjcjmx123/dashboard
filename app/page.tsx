'use client'

import AppLayout from '@/components/Layout/AppLayout'
import Dashboard from '@/components/Dashboard/Dashboard'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const handleNavigate = (view: string) => {
    router.push(`/${view}`)
  }

  return (
    <AppLayout>
      <Dashboard onNavigate={handleNavigate} />
    </AppLayout>
  )
}
