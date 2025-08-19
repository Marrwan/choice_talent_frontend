import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/store'
import { ApiRequestError } from '@/lib/api'

export const useAuthErrorHandler = () => {
  const router = useRouter()
  const { logout } = useAuth()

  const handleAuthError = async (error: unknown) => {
    // Check if it's an authentication error
    if (error instanceof ApiRequestError) {
      if (error.status === 401 || error.status === 403) {
        console.log('[AuthErrorHandler] Authentication error detected, redirecting to login')
        await logout()
        return
      }
    }

    // Check if it's a regular Error with authentication-related message
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      if (
        message.includes('unauthorized') ||
        message.includes('forbidden') ||
        message.includes('token') ||
        message.includes('authentication') ||
        message.includes('401') ||
        message.includes('403')
      ) {
        console.log('[AuthErrorHandler] Authentication error detected in message, redirecting to login')
        await logout()
        return
      }
    }

    // If it's not an auth error, re-throw it so it can be handled normally
    throw error
  }

  return { handleAuthError }
}
