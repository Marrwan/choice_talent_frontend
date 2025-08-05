'use client'

import React, { useEffect } from 'react'
import { useAuth } from '@/lib/store'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { initialize, isInitialized, isLoading } = useAuth()

  useEffect(() => {
    console.log('[AuthProvider] Initializing auth state...')
    // Initialize auth state when the app loads
    initialize().catch(error => {
      console.error('[AuthProvider] Auth initialization failed:', error)
    })
  }, [initialize])

  // Show loading screen while initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0044CC] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
          <p className="text-sm text-gray-500">Initializing authentication...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 