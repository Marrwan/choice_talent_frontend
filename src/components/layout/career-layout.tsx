'use client'

import React from 'react'

interface CareerLayoutProps {
  children: React.ReactNode
  isAuthenticated?: boolean
  user?: any
  onLogout?: () => void
}

export function CareerLayout({ children, isAuthenticated, user, onLogout }: CareerLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
} 