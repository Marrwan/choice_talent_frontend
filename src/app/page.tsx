'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/store'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      // If logged in, redirect to Career Dashboard
      router.replace('/dashboard/career')
    } else {
      // If not logged in, redirect to resume builder page
      router.replace('/resume-builder')
    }
  }, [router, isAuthenticated])

  // Return null to avoid any flash of content
  return null
}
