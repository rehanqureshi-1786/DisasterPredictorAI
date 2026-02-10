'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import LoginPage from '@/pages/login-page'
import MainLayout from '@/components/layout/main-layout'

export default function Home() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if user is stored in localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser && !isAuthenticated) {
      // Could restore auth state here
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <MainLayout />
}
