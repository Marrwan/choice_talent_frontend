"use client"

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authService } from '@/services/authService'
import type { User } from '@/services/userService'
import { tokenManager } from '@/lib/api'
import { browserUtils } from '@/lib/utils'

// Import socket service for cleanup
let socketService: any = null

// Function to set socket service reference
export const setSocketService = (service: any) => {
  socketService = service
}

interface AuthState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  token: string | null
  
  // Actions
  login: (user: User, token?: string) => void
  logout: () => Promise<void>
  updateUser: (user: Partial<User>) => void
  setLoading: (loading: boolean) => void
  initialize: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      token: null,

      // Actions
      login: (user: User, token?: string) => {
        if (token) {
          tokenManager.set(token)
          set({ token })
        }
        set({
          user: {
            ...user,
            subscriptionStatus: user.subscriptionStatus || 'free',
            isPremium: user.isPremium || false
          },
          isAuthenticated: true,
          isLoading: false
        })
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          
          // Disconnect socket first
          if (socketService) {
            socketService.disconnect()
          }
          
          await authService.logout()
        } catch (error) {
          console.warn('Logout error:', error)
        } finally {
          // Clear token and state
          tokenManager.remove()
          
          // Clear all browser storage
          if (typeof window !== 'undefined') {
            try {
              localStorage.clear()
              sessionStorage.clear()
              
              // Clear IndexedDB if it exists
              if ('indexedDB' in window) {
                indexedDB.databases().then(databases => {
                  databases.forEach(db => {
                    if (db.name) {
                      indexedDB.deleteDatabase(db.name)
                    }
                  })
                })
              }
              
              // Clear cookies
              document.cookie.split(";").forEach(cookie => {
                const eqPos = cookie.indexOf("=")
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
              })
            } catch (storageError) {
              console.warn('Error clearing storage:', storageError)
            }
          }
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            token: null,
            isInitialized: true // Keep initialized to prevent re-initialization loops
          })
          
          // Navigate to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { 
              ...currentUser, 
              ...userData,
              subscriptionStatus: userData.subscriptionStatus || currentUser.subscriptionStatus || 'free',
              isPremium: userData.isPremium || currentUser.isPremium || false
            }
          })
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      // Initialize auth state on app load
      initialize: async () => {
        if (get().isInitialized) return
        set({ isLoading: true })
        try {
          // First check localStorage directly
          const localStorageToken = tokenManager.get()
          const storeToken = get().token
          const token = storeToken || localStorageToken
          
          if (token) {
            // Ensure token is in both places
            tokenManager.set(token)
            set({ token })
            
            // Verify token and get user data
            const user = await authService.getProfile()
            
            set({
              user: {
                ...user,
                subscriptionStatus: user.subscriptionStatus || 'free',
                isPremium: user.isPremium || false
              },
              isAuthenticated: true,
              isInitialized: true,
              token
            })
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isInitialized: true,
              token: null
            })
          }
        } catch (error) {
          console.error('[AuthStore] Auth initialization failed:', error)
          // Clear invalid token and redirect to login if it's an auth error
          tokenManager.remove()
          set({
            user: null,
            isAuthenticated: false,
            isInitialized: true,
            token: null
          })
          
          // If we're on an authenticated page, redirect to login
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname
            const isAuthPage = currentPath.startsWith('/login') || currentPath.startsWith('/register') || currentPath === '/'
            if (!isAuthPage) {
              console.log('[AuthStore] Redirecting to login due to auth initialization failure')
              window.location.href = '/login'
            }
          }
        } finally {
          set({ isLoading: false })
        }
      },

      // Refresh user data
      refreshUser: async () => {
        if (!get().isAuthenticated) return
        try {
          const user = await authService.getProfile()
          set({ 
            user: {
              ...user,
              subscriptionStatus: user.subscriptionStatus || 'free',
              isPremium: user.isPremium || false
            }
          })
        } catch (error) {
          console.error('Failed to refresh user:', error)
          // If token is invalid, logout
          if (error instanceof Error && error.message.includes('401')) {
            get().logout()
          }
        }
      }
    }),
    {
      name: 'choice-talent-auth',
      storage: createJSONStorage(() => {
        const browserName = browserUtils.getBrowserName()
        const storage = browserUtils.getBestStorage()
        return storage || localStorage // Fallback to localStorage if browserUtils fails
      }),
      partialize: (state) => {
        return {
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          token: state.token,
          isInitialized: state.isInitialized
        }
      },
      onRehydrateStorage: () => (state) => {
        // Storage rehydration completed
      },
    }
  )
)

// Helper hooks
export const useAuth = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    isInitialized,
    login, 
    logout, 
    updateUser, 
    setLoading,
    initialize,
    refreshUser
  } = useAuthStore()
  
  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    login,
    logout,
    updateUser,
    setLoading,
    initialize,
    refreshUser
  }
} 