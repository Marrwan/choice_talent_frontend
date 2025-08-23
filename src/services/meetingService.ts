import { apiClient } from '@/lib/api';

export interface Meeting {
  id: string;
  recruiterId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  meetingLink: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  recruiter: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  participants: MeetingParticipant[];
}

export interface MeetingParticipant {
  id: string;
  meetingId: string;
  userId?: string;
  email?: string;
  role: 'recruiter' | 'attendee';
  status: 'invited' | 'accepted' | 'declined' | 'attended';
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
}

export interface CreateMeetingData {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  participants?: Array<{
    userId?: string;
    email?: string;
  }>;
}

export interface UpdateMeetingData {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface InviteParticipantsData {
  participants: Array<{
    userId?: string;
    email?: string;
  }>;
}

export interface MeetingTokenResponse {
  success: boolean;
  data: {
    token: string;
    meeting: {
      id: string;
      title: string;
      startTime: string;
      endTime: string;
      meetingLink: string;
    };
  };
}

export interface MeetingsData {
  meetings: Meeting[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalMeetings: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface MeetingsResponse {
  success: boolean;
  data: MeetingsData;
}

export interface SingleMeetingResponse {
  success: boolean;
  data: Meeting;
}

class MeetingService {
  // Create a new meeting
  async createMeeting(data: CreateMeetingData): Promise<SingleMeetingResponse> {
    const response = await apiClient.post<SingleMeetingResponse>('/meetings', data, true);
    return response;
  }

  // Get recruiter's meetings
  async getMeetings(page: number = 1, limit: number = 10, status?: string): Promise<MeetingsData> {
    const params: Record<string, string | number> = {
      page,
      limit,
    };
    
    if (status) {
      params.status = status;
    }

    const response = await apiClient.get<MeetingsResponse>('/meetings', true, params);
    return response.data;
  }

  // Get a single meeting
  async getMeeting(id: string): Promise<SingleMeetingResponse> {
    const response = await apiClient.get<SingleMeetingResponse>(`/meetings/${id}`, true);
    return response;
  }

  // Update a meeting
  async updateMeeting(id: string, data: UpdateMeetingData): Promise<SingleMeetingResponse> {
    const response = await apiClient.patch<SingleMeetingResponse>(`/meetings/${id}`, data, true);
    return response;
  }

  // Delete a meeting
  async deleteMeeting(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/meetings/${id}`, true);
    return response;
  }

  // Invite participants to a meeting
  async inviteParticipants(meetingId: string, data: InviteParticipantsData): Promise<{
    success: boolean;
    data: {
      meeting: Meeting;
      addedParticipants: MeetingParticipant[];
    };
  }> {
    const response = await apiClient.post<{
      success: boolean;
      data: {
        meeting: Meeting;
        addedParticipants: MeetingParticipant[];
      };
    }>(`/meetings/${meetingId}/invite`, data, true);
    return response;
  }

  // Generate meeting access token
  async generateMeetingToken(meetingId: string): Promise<MeetingTokenResponse> {
    const response = await apiClient.post<MeetingTokenResponse>(`/meetings/${meetingId}/token`, undefined, true);
    return response;
  }

  // Update participant status
  async updateParticipantStatus(
    meetingId: string, 
    participantId: string, 
    status: 'invited' | 'accepted' | 'declined' | 'attended'
  ): Promise<{ success: boolean; data: MeetingParticipant }> {
    const response = await apiClient.patch<{ success: boolean; data: MeetingParticipant }>(`/meetings/${meetingId}/participants/${participantId}/status`, { status }, true);
    return response;
  }
}

export const meetingService = new MeetingService();
