import { apiClient } from '@/lib/api';

export type ProfileType = 'professional' | 'recruiter' | 'vendor' | 'employer';

export interface Profile {
  id: string;
  user_id: string;
  type: ProfileType;
  metadata?: Record<string, any>;
  created_at: string;
}

export const profileService = {
  async list(): Promise<Profile[]> {
    const res = await apiClient.get('/api/profiles');
    return res.data?.data || [];
  },
  async create(type: ProfileType, metadata?: Record<string, any>): Promise<Profile> {
    const res = await apiClient.post('/api/profiles', { type, metadata });
    return res.data?.data;
  },
  async setActive(profileId: string): Promise<void> {
    await apiClient.post('/api/profiles/active', { profileId });
  }
};


