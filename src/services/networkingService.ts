import { apiClient } from '@/lib/api';

export interface ConnectionUser {
  id: string;
  name: string;
  username?: string;
  email: string;
  profilePicture?: string;
}

export const networkingService = {
  async search(q: string) {
    const res = await apiClient.get('/api/networking/search', { params: { q } });
    return res.data?.data as ConnectionUser[];
  },
  async listConnections() {
    const res = await apiClient.get('/api/networking/connections');
    return res.data?.data || [];
  },
  async listRequests() {
    const res = await apiClient.get('/api/networking/requests');
    return res.data?.data || [];
  },
  async sendRequest(receiverId: string) {
    const res = await apiClient.post('/api/networking/requests', { receiverId });
    return res.data?.data;
  },
  async actOnRequest(id: string, action: 'accept'|'reject') {
    const res = await apiClient.patch(`/api/networking/requests/${id}`, { action });
    return res.data?.data;
  },
};


