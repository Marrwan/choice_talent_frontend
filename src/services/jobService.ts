import { apiClient } from '@/lib/api';

export interface JobPayload {
  position: string;
  location?: string;
  isRemote?: boolean;
  description: string;
  companyName?: string;
  status?: 'draft' | 'published' | 'closed';
  jobType?: string;
  careerCategory?: string;
  categoryOfPosition?: string;
  totalYearsExperience?: number;
  workLocation?: string;
}

export const jobService = {
  async create(payload: JobPayload) {
    return apiClient.post('/jobs', payload, true);
  },
  async listMine() {
    return apiClient.get('/jobs/mine/list', true);
  },
  async updateStatus(id: string, status: 'draft'|'published'|'closed') {
    return apiClient.patch(`/jobs/${id}/status`, { status }, true);
  },
  async listPublic(params?: { q?: string; location?: string; remote?: boolean }) {
    const sp = new URLSearchParams();
    if (params?.q) sp.set('q', params.q);
    if (params?.location) sp.set('location', params.location);
    if (params?.remote) sp.set('remote', 'true');
    const qs = sp.toString();
    return apiClient.get(`/jobs${qs ? `?${qs}` : ''}`);
  },
  async getById(id: string) {
    return apiClient.get(`/jobs/${id}`);
  }
};


