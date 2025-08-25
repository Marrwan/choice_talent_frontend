import { apiClient, ApiResponse } from '@/lib/api';

export interface ConnectionUser {
  id: string;
  name: string;
  username?: string;
  email: string;
  profilePicture?: string;
}

export interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  connectedUser?: ConnectionUser;
}

export interface ConnectionRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  sender?: ConnectionUser;
  createdAt?: string;
}

export interface NetworkingStats {
  connections: number;
  pendingRequests: number;
  sentRequests: number;
}

export const networkingService = {
  async search(q: string) {
    const res = await apiClient.get<ApiResponse<ConnectionUser[]>>('/networking/search', true, { q });
    return res.data || [];
  },
  async listConnections() {
    const res = await apiClient.get<ApiResponse<Connection[]>>('/networking/connections', true);
    return res.data || [];
  },
  async listRequests() {
    const res = await apiClient.get<ApiResponse<ConnectionRequest[]>>('/networking/requests', true);
    return res.data || [];
  },
  async sendRequest(receiverId: string) {
    const res = await apiClient.post<ApiResponse<ConnectionRequest>>('/networking/requests', { receiverId }, true);
    return res.data;
  },
  async actOnRequest(id: string, action: 'accept'|'reject') {
    const res = await apiClient.patch<ApiResponse<ConnectionRequest>>(`/networking/requests/${id}`, { action }, true);
    return res.data;
  },
  async getStats() {
    const res = await apiClient.get<ApiResponse<NetworkingStats>>('/networking/stats', true);
    return res.data;
  },
};


