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
  media?: File[];
  existingMedia?: string[];
}

export const serviceService = {
  async upsert(payload: ServicePayload) {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(payload).forEach(key => {
      if (key === 'media') return;
      if (key === 'existingMedia') return;
      if (payload[key as keyof ServicePayload] !== undefined) {
        formData.append(key, String(payload[key as keyof ServicePayload]));
      }
    });
    
    // Add media files
    if (payload.media && payload.media.length > 0) {
      payload.media.forEach(file => {
        formData.append('media', file);
      });
    }
    // Add existing media URLs (to preserve)
    if (payload.existingMedia && payload.existingMedia.length > 0) {
      formData.append('existingMedia', JSON.stringify(payload.existingMedia));
    }
    
    return apiClient.post('/services', formData, true);
  },
  async mine() {
    return apiClient.get('/services/mine', true);
  },
  async getOverview() {
    return apiClient.get('/services/overview/mine', true);
  },
  async saveOverview(payload: { description: string; availability: string[]; pricing: string | null; pricingType?: 'hourly' | 'daily' | 'monthly' | null; }) {
    return apiClient.post('/services/overview/mine', payload, true);
  },
  async getById(id: string) {
    return apiClient.get(`/services/${id}`);
  },
  async update(id: string, payload: ServicePayload) {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(payload).forEach(key => {
      if (key === 'media') return;
      if (key === 'existingMedia') return;
      if (payload[key as keyof ServicePayload] !== undefined) {
        formData.append(key, String(payload[key as keyof ServicePayload]));
      }
    });
    
    // Add media files
    if (payload.media && payload.media.length > 0) {
      payload.media.forEach(file => {
        formData.append('media', file);
      });
    }
    // Add existing media URLs (to preserve)
    if (payload.existingMedia && payload.existingMedia.length > 0) {
      formData.append('existingMedia', JSON.stringify(payload.existingMedia));
    }
    
    return apiClient.put(`/services/${id}`, formData, true);
  },
  async remove(id: string) {
    return apiClient.delete(`/services/${id}`, true);
  },
  async search(params: { q?: string; category?: string }) {
    const sp = new URLSearchParams(params as any).toString();
    return apiClient.get(`/services/search?${sp}`);
  }
};


