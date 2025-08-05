'use client'

import { useAuth } from '@/lib/store'
import { tokenManager } from '@/lib/api'

export function AuthDebug() {
  const { user, isAuthenticated, isLoading, isInitialized, token } = useAuth()
  
  const localStorageToken = tokenManager.get()
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>Initialized: {isInitialized ? '✅' : '❌'}</div>
        <div>Loading: {isLoading ? '🔄' : '✅'}</div>
        <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>Has User: {user ? '✅' : '❌'}</div>
        <div>Store Token: {token ? '✅' : '❌'}</div>
        <div>LocalStorage Token: {localStorageToken ? '✅' : '❌'}</div>
        {user && (
          <div>User: {user.name || user.email}</div>
        )}
      </div>
    </div>
  )
} 