import { apiClient } from '@/lib/api';

export interface ServicePayload {
  category: string;
  serviceName: string;
  description?: string;
  location?: string;
  pricingAmount?: number;
  pricingCurrency?: string;
  pricingType?: string;
  remoteAvailable?: boolean;
  allowMessages?: boolean;
  status?: 'draft' | 'published';
}

export const serviceService = {
  async upsert(payload: ServicePayload) {
    return apiClient.post('/services', payload, { auth: true });
  },
  async mine() {
    return apiClient.get('/services/mine', { auth: true });
  },
  async remove(id: string) {
    return apiClient.delete(`/services/${id}`, { auth: true });
  },
  async search(params: { q?: string; category?: string }) {
    const sp = new URLSearchParams(params as any).toString();
    return apiClient.get(`/services/search?${sp}`);
  }
};


