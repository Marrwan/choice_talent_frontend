import { apiClient, tokenManager } from '@/lib/api'
import type { User } from './userService'

// Types for authentication
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  role?: 'professional' | 'recruiter'
}

export interface LoginResponse {
  user: User
  token: string
  message: string
}

export interface RegisterResponse {
  user: User
  message: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ActivateAccountResponse {
  user: User
  message: string
}

// Authentication Service
export const authService = {
  // Register new user
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.request<{ success: boolean; message: string; data: { user: User } }>({
      method: 'POST',
      endpoint: '/auth/register',
      data
    })
    return {
      user: response.data.user,
      message: response.message
    }
  },

  // Activate account
  async activateAccount(token: string): Promise<ActivateAccountResponse> {
    const response = await apiClient.request<{ success: boolean; message: string; data: { user: User } }>({
      method: 'GET',
      endpoint: `/auth/activate/${token}`
    })
    return {
      user: response.data.user,
      message: response.message
    }
  },

  // Resend activation email
  async resendActivation(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>('/auth/resend-activation', { email })
    return { message: response.message }
  },

  // Login user
  async login(data: LoginRequest): Promise<LoginResponse> {
    console.log('[AuthService] Attempting login for:', data.email)
    const response = await apiClient.request<{ success: boolean; message: string; data: { user: User; token: string } }>({
      method: 'POST',
      endpoint: '/auth/login',
      data
    })
    console.log('[AuthService] Login successful, token received:', !!response.data.token)
    return {
      user: response.data.user,
      token: response.data.token,
      message: response.message
    }
  },

  // Logout user
  async logout(): Promise<void> {
    console.log('[AuthService] Attempting logout')
    try {
      await apiClient.post('/auth/logout', {}, true)
      console.log('[AuthService] Logout API call successful')
    } catch (error) {
      // Even if logout fails on server, continue with local cleanup
      console.warn('Logout API call failed:', error)
    }
    // Note: Token removal is handled by the auth store to ensure proper cleanup
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    console.log('[AuthService] Getting user profile')
    const response = await apiClient.request<{ success: boolean; data: { user: User } }>({
      method: 'GET',
      endpoint: '/auth/profile',
      requiresAuth: true
    })
    console.log('[AuthService] Profile retrieved successfully')
    return response.data.user
  },

  // Forgot password
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>('/auth/forgot-password', data)
    return { message: response.message }
  },

  // Reset password
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>('/auth/reset-password', data)
    return { message: response.message }
  },

  // Change password
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>('/auth/change-password', data, true)
    return { message: response.message }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!tokenManager.get()
  },

  // Get stored token
  getToken(): string | null {
    return tokenManager.get()
  }
} 