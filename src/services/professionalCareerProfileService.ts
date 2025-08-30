import { apiClient } from '../lib/api';

export interface WorkExperience {
  id?: string;
  companyName: string;
  companyLocation?: string;
  designation: string;
  entryDate: string;
  exitDate?: string;
  isCurrentJob?: boolean;
  jobDescription?: string;
  achievements?: string;
  employerOrSupervisorName?: string;
  officialPhone?: string;
  officialEmail?: string;
  referenceDisplayPdf?: 'show' | 'available' | 'hide';
  referenceDisplayOnline?: 'show' | 'available' | 'hide';
}

export interface HigherEducation {
  id?: string;
  institutionName: string;
  location?: string;
  courseOfStudy: string;
  qualification: string;
  entryYear: number;
  graduationYear?: number;
}

export interface BasicEducation {
  id?: string;
  schoolName: string;
  certification?: string;
  year?: number;
  educationType: 'Primary' | 'Secondary';
}

export interface ProfessionalMembership {
  id?: string;
  professionalBodyName: string;
  yearOfJoining?: number;
}

export interface TrainingCertification {
  id?: string;
  trainingOrganization: string;
  certificationName: string;
  dateOfCertification?: string;
}

export interface ReferenceDetail {
  id?: string;
  refereeName: string;
  occupation?: string;
  location?: string;
  contactNumber?: string;
  emailAddress?: string;
}

export interface ProfessionalCareerProfile {
  id?: string;
  userId?: string;
  profilePicture?: string;
  firstName: string;
  otherName?: string;
  lastName: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  phoneNumber?: string;
  emailAddress?: string;
  address?: string;
  lgaOfResidence?: string;
  stateOfResidence?: string;
  country?: string;
  professionalSummary?: string;
  persona?: string;
  expertiseCompetencies?: string[];
  softwareSkills?: string[];
  nyscStatus?: 'Completed' | 'Ongoing' | 'Exempted' | 'Not Applicable' | 'Foreigner';
  nyscCompletionDate?: string;
  workExperiences?: WorkExperience[];
  higherEducations?: HigherEducation[];
  basicEducations?: BasicEducation[];
  professionalMemberships?: ProfessionalMembership[];
  trainingCertifications?: TrainingCertification[];
  referenceDetails?: ReferenceDetail[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileResponse {
  success: boolean;
  data: {
    profile: ProfessionalCareerProfile | null;
  };
  message?: string;
}

export const professionalCareerProfileService = {
  async aiAssistProfile(): Promise<{ success: boolean; data: { suggestions: any; optimized_fields: any } }> {
    return apiClient.request({ method: 'POST', endpoint: '/ai/assist/profile', requiresAuth: true })
  },
  // Get professional career profile
  async getProfile(): Promise<ProfileResponse> {
    const response = await apiClient.get<ProfileResponse>('/professional-career-profile', true);
    return response;
  },

  // Create or update professional career profile
  async createOrUpdateProfile(
    profileData: Partial<ProfessionalCareerProfile>,
    profilePicture?: File
  ): Promise<ProfileResponse> {
    const formData = new FormData();
    
    console.log('Creating FormData for profile update');
    console.log('Profile picture provided:', profilePicture ? 'Yes' : 'No');
    
    // Add profile picture if provided
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
      console.log('Added profile picture to FormData:', profilePicture.name);
    }

    // Add all profile data as individual form fields
    Object.entries(profileData).forEach(([key, value]) => {
      if (key !== 'profilePicture' && value !== undefined) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (value === null) {
          formData.append(key, '');
        } else {
          formData.append(key, String(value));
        }
      }
    });

    console.log('FormData entries:', Array.from(formData.entries()).map(([key, value]) => ({
      key,
      type: value instanceof File ? 'File' : 'String',
      size: value instanceof File ? value.size : (value as string).length
    })));

    const response = await apiClient.post<ProfileResponse>('/professional-career-profile', formData, true);
    return response;
  },

  // Delete professional career profile
  async deleteProfile(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>('/professional-career-profile', true);
    return response;
  },
}; 