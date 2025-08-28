import { apiClient } from '@/lib/api';

export const applicationService = {
  async apply(jobId: string, coverNote?: string) {
    return apiClient.post(`/jobs/${jobId}/apply`, { jobId, coverNote }, true);
  },
  async listByJob(jobId: string) {
    return apiClient.get(`/jobs/${jobId}/applications`, true);
  },
  async updateStatus(applicationId: string, status: 'submitted'|'shortlisted'|'rejected'|'interview_scheduled'|'hired') {
    return apiClient.patch(`/jobs/applications/${applicationId}/status`, { status }, true);
  }
};


