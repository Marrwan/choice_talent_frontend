'use client'

import React from 'react'
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from '@/components/ui/toast'

interface ToastState {
  id: string
  title?: string
  description: string
  variant?: 'default' | 'destructive' | 'success'
  duration?: number
}

interface ToastContextType {
  toasts: ToastState[]
  addToast: (toast: Omit<ToastState, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {}
})

export function ToastContextProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastState[]>([])

  const addToast = React.useCallback((toast: Omit<ToastState, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastState = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after duration
    const duration = toast.duration || (toast.variant === 'destructive' ? 8000 : 6000)
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const contextValue = React.useMemo(() => ({
    toasts,
    addToast,
    removeToast
  }), [toasts, addToast, removeToast])

  return (
    <ToastContext.Provider value={contextValue}>
      <ToastProvider>
        {children}
        <ToastViewport>
          {toasts.map(toast => (
            <Toast key={toast.id} variant={toast.variant}>
              {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
              <ToastDescription>{toast.description}</ToastDescription>
              <ToastClose onClick={() => removeToast(toast.id)} />
            </Toast>
          ))}
        </ToastViewport>
      </ToastProvider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastContextProvider')
  }
  
  return {
    showToast: context.addToast,
    showError: (message: string, title?: string, duration?: number) => 
      context.addToast({ description: message, title, variant: 'destructive', duration }),
    showSuccess: (message: string, title?: string, duration?: number) => 
      context.addToast({ description: message, title, variant: 'success', duration }),
    showInfo: (message: string, title?: string, duration?: number) => 
      context.addToast({ description: message, title, duration })
  }
} 