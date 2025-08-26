import { apiClient } from '@/lib/api'

// Extended user interface with new profile fields
export interface User {
  id: string
  email: string
  name: string
  role?: 'professional' | 'recruiter'
  realName?: string
  username?: string
  profilePicture?: string
  careerProfilePicture?: string
  dateOfBirth?: string
  gender?: string
  occupation?: string
  country?: string
  state?: string
  lga?: string
  contactNumber?: string
  isEmailVerified: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
  subscriptionStatus?: 'free' | 'premium'
  isPremium?: boolean
}

export interface UpdateProfileRequest {
  name?: string
  realName?: string
  username?: string
  profilePicture?: string
  interests?: string
  dateOfBirth?: string
  gender?: string
  occupation?: string
  country?: string
  state?: string
  lga?: string
  contactNumber?: string
  email?: string
}

export interface DashboardStats {
  memberSince: string
  lastLogin?: string
  profileCompletion: number
}

// User Service
export const userService = {
  // Get user profile
  async getProfile(): Promise<User> {
    const response = await apiClient.request<{ success: boolean; data: { user: User } }>({
      method: 'GET',
      endpoint: '/user/profile',
      requiresAuth: true
    })
    return response.data.user
  },

  // Update user profile
  async updateProfile(data: UpdateProfileRequest): Promise<{ user: User; message: string }> {
    const response = await apiClient.request<{ success: boolean; message: string; data: { user: User } }>({
      method: 'PUT',
      endpoint: '/user/profile',
      data,
      requiresAuth: true
    })
    return {
      user: response.data.user,
      message: response.message
    }
  },

  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.request<{ success: boolean; data: DashboardStats }>({
      method: 'GET',
      endpoint: '/user/dashboard',
      requiresAuth: true
    })
    return response.data
  },

  // Change password

  // Get all users (for group creation)
  async getUsers(): Promise<{ success: boolean; data: User[] }> {
    const response = await apiClient.request<{ success: boolean; data: User[] }>({
      method: 'GET',
      endpoint: '/user/users',
      requiresAuth: true
    })
    return response
  },

  // Search users
  async searchUsers(query: string): Promise<{ success: boolean; data: User[] }> {
    const response = await apiClient.request<{ success: boolean; data: User[] }>({
      method: 'GET',
      endpoint: `/user/search?q=${encodeURIComponent(query)}`,
      requiresAuth: true
    })
    return response
  },
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const response = await apiClient.request<{ success: boolean; message: string }>({
      method: 'POST',
      endpoint: '/user/change-password',
      data: { oldPassword: data.currentPassword, newPassword: data.newPassword },
      requiresAuth: true
    })
    return { message: response.message }
  },

  // Deactivate account
  async deactivateAccount(): Promise<{ message: string }> {
    const response = await apiClient.request<{ success: boolean; message: string }>({
      method: 'POST',
      endpoint: '/user/deactivate-account',
      requiresAuth: true
    })
    return { message: response.message }
  },

  async uploadCareerProfilePicture(formData: FormData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.request<{ success: boolean; message: string }>({
        method: 'POST',
        endpoint: '/user/career-profile-picture',
        data: formData,
        requiresAuth: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response
    } catch (error) {
      console.error('Error uploading career profile picture:', error)
      throw error
    }
  },

  async uploadCareerBannerPicture(formData: FormData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.request<{ success: boolean; message: string }>({
        method: 'POST',
        endpoint: '/user/career-banner-picture',
        data: formData,
        requiresAuth: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response
    } catch (error) {
      console.error('Error uploading career banner picture:', error)
      throw error
    }
  },

  async deleteCareerProfilePicture(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.request<{ success: boolean; message: string }>({
        method: 'DELETE',
        endpoint: '/user/career-profile-picture',
        requiresAuth: true,
      })
      return response
    } catch (error) {
      console.error('Error deleting career profile picture:', error)
      throw error
    }
  },

  async deleteCareerBannerPicture(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.request<{ success: boolean; message: string }>({
        method: 'DELETE',
        endpoint: '/user/career-banner-picture',
        requiresAuth: true,
      })
      return response
    } catch (error) {
      console.error('Error deleting career banner picture:', error)
      throw error
    }
  },

  // Check if profile is complete
  isProfileComplete(user: User): boolean {
    const requiredFields: (keyof User)[] = [
      'realName', 'username', 'dateOfBirth', 'gender', 
      'occupation', 'country', 'state', 'lga'
    ]
    
    return requiredFields.every(field => {
      const value = user[field]
      return value && value.toString().trim() !== ''
    })
  },

  // Calculate profile completion percentage
  getProfileCompletionPercentage(user: User): number {
    const allFields: (keyof User)[] = [
      'realName', 'username', 'profilePicture', 'dateOfBirth', 'gender', 
      'occupation', 'country', 'state', 'lga', 'contactNumber'
    ]
    
    const completedFields = allFields.filter(field => {
      const value = user[field]
      return value && value.toString().trim() !== ''
    })
    
    return Math.round((completedFields.length / allFields.length) * 100)
  }
} 