import { apiClient } from '@/lib/api'

export interface RecruiterProfile {
  companyName: string
  industry?: string
  location?: string
  contactEmail?: string
  contactPhone?: string
  logoUrl?: string
  website?: string
  workforceSize?: string | number
  about?: string
}

export const recruiterService = {
  async getProfile() {
    return apiClient.request<{ success: boolean; data: { profile: RecruiterProfile | null } }>({
      method: 'GET', endpoint: '/recruiter/profile', requiresAuth: true
    })
  },
  async saveProfile(data: RecruiterProfile) {
    return apiClient.request<{ success: boolean; message: string; data: { profile: RecruiterProfile } }>({
      method: 'POST', endpoint: '/recruiter/profile', data, requiresAuth: true
    })
  },
  async saveProfileForm(formData: FormData) {
    return apiClient.request<{ success: boolean; message: string; data: { profile: RecruiterProfile } }>({
      method: 'POST', endpoint: '/recruiter/profile', data: formData, requiresAuth: true
    })
  },
  async search(params: { position?: string; description?: string; location?: string; categories?: string[]; jobTypes?: string[]; careerCategories?: string[]; minExperience?: number }) {
    const q = new URLSearchParams()
    if (params.position) q.set('position', params.position)
    if (params.description) q.set('description', params.description)
    if (params.location) q.set('location', params.location)
    if (params.categories && params.categories.length) q.set('categories', params.categories.join(','))
    if (params.jobTypes && params.jobTypes.length) q.set('jobTypes', params.jobTypes.join(','))
    if (params.careerCategories && params.careerCategories.length) q.set('careerCategories', params.careerCategories.join(','))
    if (typeof params.minExperience === 'number') q.set('minExperience', String(params.minExperience))
    return apiClient.request<{ success: boolean; data: { results: any[] } }>({
      method: 'GET', endpoint: `/recruiter/search?${q.toString()}`, requiresAuth: true
    })
  },
  async shortlist(candidateUserId: string, notes?: string) {
    return apiClient.request<{ success: boolean; message: string }>({
      method: 'POST', endpoint: '/recruiter/shortlist', data: { candidateUserId, notes }, requiresAuth: true
    })
  },
  async removeShortlist(candidateUserId: string) {
    return apiClient.request<{ success: boolean; message: string }>({
      method: 'POST', endpoint: '/recruiter/shortlist/remove', data: { candidateUserId }, requiresAuth: true
    })
  },
  async listShortlist() {
    return apiClient.request<{ success: boolean; data: { items: any[] } }>({
      method: 'GET', endpoint: '/recruiter/shortlist', requiresAuth: true
    })
  },
  async sendInmail(recipientId: string, subject: string, content: string) {
    return apiClient.request({ method: 'POST', endpoint: '/recruiter/inmail', data: { recipientId, subject, content }, requiresAuth: true })
  },
  async listInmail() {
    return apiClient.request<{ success: boolean; data: { inbox: any[]; sent: any[] } }>({ method: 'GET', endpoint: '/recruiter/inmail', requiresAuth: true })
  },
  async createInterview(data: any) {
    return apiClient.request({ method: 'POST', endpoint: '/recruiter/interviews', data, requiresAuth: true })
  },
  async listInterviews() {
    return apiClient.request<{ success: boolean; data: { items: any[] } }>({ method: 'GET', endpoint: '/recruiter/interviews', requiresAuth: true })
  },
  async respondInterview(interviewId: string, response: 'accepted' | 'declined', reason?: string) {
    return apiClient.request({ method: 'POST', endpoint: `/recruiter/interviews/${interviewId}/respond`, data: { response, reason }, requiresAuth: true })
  },
  async createAssessment(payload: { candidateUserId: string; title: string; questions: any[] }) {
    return apiClient.request({ method: 'POST', endpoint: '/recruiter/assessments', data: payload, requiresAuth: true })
  },
  async listAssessments() {
    return apiClient.request<{ success: boolean; data: { items: any[] } }>({ method: 'GET', endpoint: '/recruiter/assessments', requiresAuth: true })
  },
  async submitAssessmentResponses(assessmentId: string, responses: any[]) {
    return apiClient.request({ method: 'POST', endpoint: `/recruiter/assessments/${assessmentId}/responses`, data: { responses }, requiresAuth: true })
  }
}


