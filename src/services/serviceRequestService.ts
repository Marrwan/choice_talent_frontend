import { apiClient } from '@/lib/api';

export interface ServiceRequestPayload {
  serviceId: string;
  title: string;
  description: string;
  budget?: number;
  budgetCurrency?: string;
  timeline?: string;
}

export interface ServiceRequest {
  id: string;
  requesterId: string;
  serviceId: string;
  providerId: string;
  title: string;
  description: string;
  budget?: number;
  budgetCurrency?: string;
  timeline?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  conversationId?: string;
  acceptedAt?: string;
  declinedAt?: string;
  completedAt?: string;
  declineReason?: string;
  createdAt: string;
  updatedAt: string;
  service?: {
    id: string;
    serviceName: string;
    category: string;
    description?: string;
  };
  requester?: {
    id: string;
    name?: string;
    realName?: string;
    email: string;
    profilePicture?: string;
  };
  provider?: {
    id: string;
    name?: string;
    realName?: string;
    email: string;
    profilePicture?: string;
  };
}

export const serviceRequestService = {
  // Create a new service request
  async create(payload: ServiceRequestPayload) {
    return apiClient.post('/service-requests', payload, true);
  },

  // Get service requests for a provider (user's services)
  async getProviderRequests(status?: string) {
    const params = status ? `?status=${status}` : '';
    return apiClient.get(`/service-requests/provider${params}`, true);
  },

  // Get service requests made by a user
  async getRequesterRequests(status?: string) {
    const params = status ? `?status=${status}` : '';
    return apiClient.get(`/service-requests/requester${params}`, true);
  },

  // Get a specific service request
  async getById(id: string) {
    return apiClient.get(`/service-requests/${id}`, true);
  },

  // Accept a service request
  async accept(id: string) {
    return apiClient.post(`/service-requests/${id}/accept`, {}, true);
  },

  // Decline a service request
  async decline(id: string, reason?: string) {
    return apiClient.post(`/service-requests/${id}/decline`, { reason }, true);
  }
};
