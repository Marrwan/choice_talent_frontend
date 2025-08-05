import { apiClient } from '@/lib/api';

export interface Plan {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'cancelled';
  plan?: Plan;
}

export const paymentService = {
  async getPlans(): Promise<Plan[]> {
    const response = await apiClient.request<{ success: boolean; data: Plan[] }>({
      method: 'GET',
      endpoint: '/payments/plans',
      requiresAuth: true,
    });
    return response.data;
  },

  async initializePayment(planId: string): Promise<any> {
    const response = await apiClient.request<any>({
      method: 'POST',
      endpoint: '/payments/initialize',
      data: { planId },
      requiresAuth: true,
    });
    return response;
  },

  async verifyPayment(reference: string): Promise<any> {
    const response = await apiClient.request<any>({
      method: 'GET',
      endpoint: `/payments/verify/${reference}`,
      requiresAuth: true,
    });
    return response;
  },

  async getCurrentSubscription(): Promise<{ subscription: Subscription | null; isActive: boolean }> {
    const response = await apiClient.request<{ success: boolean; data: { subscription: Subscription | null; isActive: boolean } }>({
      method: 'GET',
      endpoint: '/payments/subscription',
      requiresAuth: true,
    });
    return response.data;
  },

  async cancelSubscription(): Promise<any> {
    const response = await apiClient.request<any>({
      method: 'POST',
      endpoint: '/payments/subscription/cancel',
      requiresAuth: true,
    });
    return response;
  },
}; 