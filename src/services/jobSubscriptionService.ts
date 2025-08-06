import { apiClient } from '@/lib/api';

// Types
export interface SubscriptionPackage {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  features: string[];
}

export interface EligibilityResponse {
  isEligible: boolean;
  hasActiveSubscription: boolean;
  activeSubscription?: {
    id: string;
    subscriptionType: string;
    startDate: string;
    endDate: string;
    status: string;
  };
}

export interface JobSubscription {
  id: string;
  userId: string;
  subscriptionType: string;
  price: number;
  duration: number;
  status: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  payments?: JobPayment[];
}

export interface JobPayment {
  id: string;
  subscriptionId: string;
  paymentId: string;
  amount: number;
  paymentMethod: 'bank_transfer' | 'flutterwave' | 'paystack';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  proofOfPayment?: string;
  transactionReference?: string;
  paymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobActivityLog {
  id: string;
  userId: string;
  subscriptionId: string;
  activityType: 'profile_forwarded' | 'profile_screened' | 'feedback_received';
  companyName?: string;
  companyLocation?: string;
  position?: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  createdAt: string;
  updatedAt: string;
  subscription?: {
    id: string;
    subscriptionType: string;
    status: string;
  };
}

export interface CreateSubscriptionRequest {
  subscriptionType: string;
}

export interface CreatePaymentRequest {
  subscriptionId: string;
  paymentMethod: 'bank_transfer' | 'flutterwave' | 'paystack';
}

export interface UploadProofRequest {
  paymentId: string;
  proofOfPayment: File;
}

// Service
export const jobSubscriptionService = {
  // Check eligibility
  async checkEligibility(): Promise<EligibilityResponse> {
    const response = await apiClient.get<EligibilityResponse>('/job-subscription/eligibility', true);
    return response.data;
  },

  // Get subscription packages with updated pricing
  async getSubscriptionPackages(): Promise<SubscriptionPackage[]> {
    // Return hardcoded packages with new pricing structure
    return [
      {
        id: '0-2_years',
        name: '0-2 Years Experience',
        price: 3000,
        duration: 6,
        description: 'For professionals with 0-2 years of work experience',
        features: [
          'Profile forwarding to employers',
          'Career advisory',
          'Profile screening',
          'Job application feedback',
          'Profile assessment feedback'
        ]
      },
      {
        id: '3-5_years',
        name: '3-5 Years Experience',
        price: 5000,
        duration: 6,
        description: 'For professionals with 3-5 years of work experience',
        features: [
          'Profile forwarding to employers',
          'Career advisory',
          'Profile screening',
          'Job application feedback',
          'Profile assessment feedback'
        ]
      },
      {
        id: '6-7_years',
        name: '6-7 Years Experience',
        price: 7000,
        duration: 6,
        description: 'For professionals with 6-7 years of work experience',
        features: [
          'Profile forwarding to employers',
          'Career advisory',
          'Profile screening',
          'Job application feedback',
          'Profile assessment feedback'
        ]
      },
      {
        id: '10_plus_years',
        name: '10+ Years Experience',
        price: 10000,
        duration: 6,
        description: 'For professionals with 10+ years of work experience',
        features: [
          'Profile forwarding to employers',
          'Career advisory',
          'Profile screening',
          'Job application feedback',
          'Profile assessment feedback'
        ]
      }
    ];
  },

  // Create subscription
  async createSubscription(data: CreateSubscriptionRequest): Promise<{ subscription: JobSubscription }> {
    const response = await apiClient.post<{ subscription: JobSubscription }>('/job-subscription/subscriptions', data, true);
    return response.data;
  },

  // Get user subscriptions
  async getUserSubscriptions(): Promise<JobSubscription[]> {
    const response = await apiClient.get<{ subscriptions: JobSubscription[] }>('/job-subscription/subscriptions', true);
    return response.data.subscriptions;
  },

  // Create payment
  async createPayment(data: CreatePaymentRequest): Promise<{ payment: JobPayment }> {
    const response = await apiClient.post<{ payment: JobPayment }>('/job-subscription/payments', data, true);
    return response.data;
  },

  // Upload proof of payment
  async uploadProofOfPayment(paymentId: string, file: File): Promise<{ payment: JobPayment }> {
    const formData = new FormData();
    formData.append('proofOfPayment', file);

    const response = await apiClient.post<{ payment: JobPayment }>(
      `/job-subscription/payments/${paymentId}/proof`,
      formData,
      true
    );
    return response.data;
  },

  // Get activity logs
  async getActivityLogs(): Promise<JobActivityLog[]> {
    const response = await apiClient.get<{ activityLogs: JobActivityLog[] }>('/job-subscription/activity-logs', true);
    return response.data.activityLogs;
  }
};

export default jobSubscriptionService; 