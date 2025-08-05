import { apiClient } from '@/lib/api'

// Date plan interface
export interface DatePlan {
  id: string
  userId: string
  budget: string
  expectations?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  plannedDate?: string
  location?: string
  suggestions?: string
  createdAt: string
  updatedAt: string
}

export interface CreateDatePlanRequest {
  budget: string
  expectations?: string
  plannedDate?: string
}

export interface UpdateDatePlanRequest {
  budget?: string
  expectations?: string
  plannedDate?: string
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
}

export interface DatePlanStats {
  total: number
  pending: number
  in_progress: number
  completed: number
  cancelled: number
}

export interface DatePlansResult {
  datePlans: DatePlan[]
  total: number
}

// Date Plan Service
export const datePlanService = {
  // Get user's date plans
  async getDatePlans(status?: string): Promise<DatePlansResult> {
    const params = status ? `?status=${encodeURIComponent(status)}` : ''
    const response = await apiClient.request<{ success: boolean; data: DatePlansResult }>({
      method: 'GET',
      endpoint: `/date-plan${params}`,
      requiresAuth: true
    })
    return response.data
  },

  // Get a specific date plan
  async getDatePlan(id: string): Promise<DatePlan> {
    const response = await apiClient.request<{ success: boolean; data: { datePlan: DatePlan } }>({
      method: 'GET',
      endpoint: `/date-plan/${id}`,
      requiresAuth: true
    })
    return response.data.datePlan
  },

  // Create a new date plan
  async createDatePlan(data: CreateDatePlanRequest): Promise<{ datePlan: DatePlan; message: string }> {
    const response = await apiClient.request<{ success: boolean; message: string; data: { datePlan: DatePlan } }>({
      method: 'POST',
      endpoint: '/date-plan',
      data,
      requiresAuth: true
    })
    return {
      datePlan: response.data.datePlan,
      message: response.message
    }
  },

  // Submit date plan request (alias for create)
  async submitDatePlanRequest(data: CreateDatePlanRequest): Promise<{ datePlan: DatePlan; message: string }> {
    const response = await apiClient.request<{ success: boolean; message: string; data: { datePlan: DatePlan } }>({
      method: 'POST',
      endpoint: '/date-plan/submit',
      data,
      requiresAuth: true
    })
    return {
      datePlan: response.data.datePlan,
      message: response.message
    }
  },

  // Update a date plan
  async updateDatePlan(id: string, data: UpdateDatePlanRequest): Promise<{ datePlan: DatePlan; message: string }> {
    const response = await apiClient.request<{ success: boolean; message: string; data: { datePlan: DatePlan } }>({
      method: 'PUT',
      endpoint: `/date-plan/${id}`,
      data,
      requiresAuth: true
    })
    return {
      datePlan: response.data.datePlan,
      message: response.message
    }
  },

  // Delete a date plan
  async deleteDatePlan(id: string): Promise<{ message: string }> {
    const response = await apiClient.request<{ success: boolean; message: string }>({
      method: 'DELETE',
      endpoint: `/date-plan/${id}`,
      requiresAuth: true
    })
    return { message: response.message }
  },

  // Get date plan statistics
  async getDatePlanStats(): Promise<DatePlanStats> {
    const response = await apiClient.request<{ success: boolean; data: { stats: DatePlanStats } }>({
      method: 'GET',
      endpoint: '/date-plan/stats',
      requiresAuth: true
    })
    return response.data.stats
  }
} 