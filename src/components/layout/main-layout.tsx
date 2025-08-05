'use client'

import React from 'react'
import { Header } from './header'
import { Footer } from './footer'

interface MainLayoutProps {
  children: React.ReactNode
  showHeader?: boolean
  showFooter?: boolean
  isAuthenticated?: boolean
  user?: {
    email: string
    name?: string
  }
  onLogout?: () => void
}

export function MainLayout({
  children,
  showHeader = true,
  showFooter = true,
  isAuthenticated = false,
  user,
  onLogout
}: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {showHeader && (
        <Header 
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={onLogout}
        />
      )}
      
      <main className="flex-1">
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  )
} 