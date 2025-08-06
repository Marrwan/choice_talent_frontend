'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to resume builder page immediately
    router.replace('/resume-builder')
  }, [router])

  // Return null to avoid any flash of content
  return null
}
