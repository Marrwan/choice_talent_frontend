'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/lib/useToast';
import { professionalCareerProfileService, ProfessionalCareerProfile, WorkExperience, HigherEducation, BasicEducation, ProfessionalMembership, TrainingCertification, ReferenceDetail } from '@/services/professionalCareerProfileService';
import { Plus, Trash2, Save, User, Briefcase, GraduationCap, School, Award, Users, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfessionalCareerProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfessionalCareerProfile>({
    fullName: '',
    gender: undefined,
    dateOfBirth: '',
    phoneNumber: '',
    emailAddress: '',
    address: '',
    lgaOfResidence: '',
    stateOfResidence: '',
    professionalSummary: '',
    persona: '',
    expertiseCompetencies: [],
    softwareSkills: [],
    nyscStatus: undefined,
    nyscCompletionDate: undefined,
    workExperiences: [],
    higherEducations: [],
    basicEducations: [],
    professionalMemberships: [],
    trainingCertifications: [],
    referenceDetails: []
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');

  // Load existing profile on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await professionalCareerProfileService.getProfile();
      console.log('Load profile response:', response);
      
      if (response.success && response.data.profile) {
        // Ensure all array fields are properly initialized and null values are converted to empty strings
        const profileData = {
          ...response.data.profile,
          // Convert null values to empty strings for text fields
          fullName: response.data.profile.fullName || '',
          phoneNumber: response.data.profile.phoneNumber || '',
          emailAddress: response.data.profile.emailAddress || '',
          address: response.data.profile.address || '',
          lgaOfResidence: response.data.profile.lgaOfResidence || '',
          stateOfResidence: response.data.profile.stateOfResidence || '',
          professionalSummary: response.data.profile.professionalSummary || '',
          persona: response.data.profile.persona || '',
          dateOfBirth: response.data.profile.dateOfBirth || '',
          // Keep arrays as arrays
          expertiseCompetencies: response.data.profile.expertiseCompetencies || [],
          softwareSkills: response.data.profile.softwareSkills || [],
          workExperiences: response.data.profile.workExperiences || [],
          higherEducations: response.data.profile.higherEducations || [],
          basicEducations: response.data.profile.basicEducations || [],
          professionalMemberships: response.data.profile.professionalMemberships || [],
          trainingCertifications: response.data.profile.trainingCertifications || [],
          referenceDetails: response.data.profile.referenceDetails || []
        };
        setProfile(profileData);
        console.log('Profile picture from response:', response.data.profile.profilePicture);
        if (response.data.profile.profilePicture) {
          console.log('Profile picture URL:', response.data.profile.profilePicture);
          setProfilePicturePreview(response.data.profile.profilePicture);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.showError('Failed to load profile', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('Saving profile with picture:', profilePicture ? 'Yes' : 'No');
      if (profilePicture) {
        console.log('Profile picture details:', {
          name: profilePicture.name,
          size: profilePicture.size,
          type: profilePicture.type
        });
      }
      
      const response = await professionalCareerProfileService.createOrUpdateProfile(profile, profilePicture || undefined);
      
      console.log('Save response:', response);
      
      if (response.success) {
        toast.showSuccess(response.message || 'Profile saved successfully', 'Success');
        // Clear the file input and preview since image is now uploaded
        setProfilePicture(null);
        setProfilePicturePreview('');
        // Always reload the profile after save to get the updated image URL
        await loadProfile();
      } else {
        toast.showError(response.message || 'Failed to save profile', 'Error');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.showError('Failed to save profile', 'Error');
    } finally {
      setSaving(false);
    }
  };

  // Dynamic array handlers
  const addWorkExperience = () => {
    setProfile(prev => ({
      ...prev,
      workExperiences: [...(prev.workExperiences || []), {
        companyName: '',
        companyLocation: '',
        designation: '',
        entryDate: '',
        exitDate: '',
        isCurrentJob: false,
        jobDescription: '',
        achievements: '',
        employerOrSupervisorName: '',
        officialPhone: '',
        officialEmail: ''
      }]
    }));
  };

  const removeWorkExperience = (index: number) => {
    setProfile(prev => ({
      ...prev,
      workExperiences: prev.workExperiences?.filter((_, i) => i !== index) || []
    }));
  };

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: any) => {
    setProfile(prev => ({
      ...prev,
      workExperiences: prev.workExperiences?.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      ) || []
    }));
  };

  const addHigherEducation = () => {
    setProfile(prev => ({
      ...prev,
      higherEducations: [...(prev.higherEducations || []), {
        institutionName: '',
        location: '',
        courseOfStudy: '',
        qualification: '',
        entryYear: 0,
        graduationYear: undefined
      }]
    }));
  };

  const removeHigherEducation = (index: number) => {
    setProfile(prev => ({
      ...prev,
      higherEducations: prev.higherEducations?.filter((_, i) => i !== index) || []
    }));
  };

  const updateHigherEducation = (index: number, field: keyof HigherEducation, value: any) => {
    setProfile(prev => ({
      ...prev,
      higherEducations: prev.higherEducations?.map((edu, i) => 
        i === index ? { ...edu, [field]: value || '' } : edu
      ) || []
    }));
  };

  const addBasicEducation = () => {
    setProfile(prev => ({
      ...prev,
      basicEducations: [...(prev.basicEducations || []), {
        schoolName: '',
        certification: '',
        year: undefined,
        educationType: 'Primary'
      }]
    }));
  };

  const removeBasicEducation = (index: number) => {
    setProfile(prev => ({
      ...prev,
      basicEducations: prev.basicEducations?.filter((_, i) => i !== index) || []
    }));
  };

  const updateBasicEducation = (index: number, field: keyof BasicEducation, value: any) => {
    setProfile(prev => ({
      ...prev,
      basicEducations: prev.basicEducations?.map((edu, i) => 
        i === index ? { ...edu, [field]: value || '' } : edu
      ) || []
    }));
  };

  const addProfessionalMembership = () => {
    setProfile(prev => ({
      ...prev,
      professionalMemberships: [...(prev.professionalMemberships || []), {
        professionalBodyName: '',
        yearOfJoining: undefined
      }]
    }));
  };

  const removeProfessionalMembership = (index: number) => {
    setProfile(prev => ({
      ...prev,
      professionalMemberships: prev.professionalMemberships?.filter((_, i) => i !== index) || []
    }));
  };

  const updateProfessionalMembership = (index: number, field: keyof ProfessionalMembership, value: any) => {
    setProfile(prev => ({
      ...prev,
      professionalMemberships: prev.professionalMemberships?.map((mem, i) => 
        i === index ? { ...mem, [field]: value || '' } : mem
      ) || []
    }));
  };

  const addTrainingCertification = () => {
    setProfile(prev => ({
      ...prev,
      trainingCertifications: [...(prev.trainingCertifications || []), {
        trainingOrganization: '',
        certificationName: '',
        dateOfCertification: ''
      }]
    }));
  };

  const removeTrainingCertification = (index: number) => {
    setProfile(prev => ({
      ...prev,
      trainingCertifications: prev.trainingCertifications?.filter((_, i) => i !== index) || []
    }));
  };

  const updateTrainingCertification = (index: number, field: keyof TrainingCertification, value: string) => {
    setProfile(prev => ({
      ...prev,
      trainingCertifications: prev.trainingCertifications?.map((cert, i) => 
        i === index ? { ...cert, [field]: value || '' } : cert
      ) || []
    }));
  };

  const addReferenceDetail = () => {
    setProfile(prev => ({
      ...prev,
      referenceDetails: [...(prev.referenceDetails || []), {
        refereeName: '',
        occupation: '',
        location: '',
        contactNumber: '',
        emailAddress: ''
      }]
    }));
  };

  const removeReferenceDetail = (index: number) => {
    setProfile(prev => ({
      ...prev,
      referenceDetails: prev.referenceDetails?.filter((_, i) => i !== index) || []
    }));
  };

  const updateReferenceDetail = (index: number, field: keyof ReferenceDetail, value: string) => {
    setProfile(prev => ({
      ...prev,
      referenceDetails: prev.referenceDetails?.map((ref, i) => 
        i === index ? { ...ref, [field]: value || '' } : ref
      ) || []
    }));
  };

  // Array input handlers
  const addArrayItem = (field: 'expertiseCompetencies' | 'softwareSkills', value: string) => {
    if (value.trim()) {
      setProfile(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: 'expertiseCompetencies' | 'softwareSkills', index: number) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || []
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
                  <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Professional Career Profile</h1>
          <p className="text-gray-600 mt-2">Update your professional career information</p>
        </div>

        <form className="space-y-6">
          {/* Bio Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Bio Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profilePicture">Profile Picture</Label>
                  <Input
                    id="profilePicture"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="mt-1"
                  />
                  {profilePicturePreview && (
                    <img
                      src={profilePicturePreview}
                      alt="Profile preview"
                      className="mt-2 h-20 w-20 object-cover rounded"
                      onError={(e) => {
                        console.error('Image failed to load:', profilePicturePreview);
                        console.error('Image error:', e);
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', profilePicturePreview);
                      }}
                    />
                  )}
                  {!profilePicturePreview && profile.profilePicture && (
                    <img
                      src={profile.profilePicture}
                      alt="Profile picture"
                      className="mt-2 h-20 w-20 object-cover rounded"
                      onError={(e) => {
                        console.error('Image failed to load:', profile.profilePicture);
                        console.error('Image error:', e);
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', profile.profilePicture);
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={profile.fullName || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={profile.gender} onValueChange={(value) => setProfile(prev => ({ ...prev, gender: value as any }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profile.dateOfBirth || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={profile.phoneNumber || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emailAddress">Email Address</Label>
                <Input
                  id="emailAddress"
                  type="email"
                  value={profile.emailAddress || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, emailAddress: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={profile.address || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lgaOfResidence">LGA of Residence</Label>
                  <Input
                    id="lgaOfResidence"
                    value={profile.lgaOfResidence || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, lgaOfResidence: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="stateOfResidence">State of Residence</Label>
                  <Input
                    id="stateOfResidence"
                    value={profile.stateOfResidence || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, stateOfResidence: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Summary & Persona */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Professional Summary & Persona
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="professionalSummary">Professional Summary</Label>
                <Textarea
                  id="professionalSummary"
                  value={profile.professionalSummary || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, professionalSummary: e.target.value }))}
                  placeholder="Describe your professional background or personal summary..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="persona">Persona</Label>
                <Textarea
                  id="persona"
                  value={profile.persona || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, persona: e.target.value }))}
                  placeholder="Describe your professional persona or soft skills/personality..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Expertise & Competencies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Expertise & Competencies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Areas of Expertise</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Add expertise..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('expertiseCompetencies', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add expertise..."]') as HTMLInputElement;
                      if (input) {
                        addArrayItem('expertiseCompetencies', input.value);
                        input.value = '';
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.expertiseCompetencies?.map((item, index) => (
                    <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                      <span>{item}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem('expertiseCompetencies', index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Software Skills</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Add software skill..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('softwareSkills', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add software skill..."]') as HTMLInputElement;
                      if (input) {
                        addArrayItem('softwareSkills', input.value);
                        input.value = '';
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.softwareSkills?.map((item, index) => (
                    <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                      <span>{item}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem('softwareSkills', index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.workExperiences?.map((experience, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Work Experience {index + 1}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeWorkExperience(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Company Name *</Label>
                      <Input
                        value={experience.companyName || ''}
                        onChange={(e) => updateWorkExperience(index, 'companyName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Company Location</Label>
                      <Input
                        value={experience.companyLocation || ''}
                        onChange={(e) => updateWorkExperience(index, 'companyLocation', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Designation *</Label>
                      <Input
                        value={experience.designation || ''}
                        onChange={(e) => updateWorkExperience(index, 'designation', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Entry Date *</Label>
                      <Input
                        type="date"
                        value={experience.entryDate || ''}
                        onChange={(e) => updateWorkExperience(index, 'entryDate', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`current-job-${index}`}
                        checked={experience.isCurrentJob || false}
                        onCheckedChange={(checked) => {
                          updateWorkExperience(index, 'isCurrentJob', checked as boolean);
                          if (checked) {
                            updateWorkExperience(index, 'exitDate', '');
                          }
                        }}
                      />
                      <Label htmlFor={`current-job-${index}`} className="text-sm font-normal cursor-pointer">
                        I currently work here
                      </Label>
                    </div>
                  </div>

                  {!experience.isCurrentJob && (
                    <div>
                      <Label>Exit Date</Label>
                      <Input
                        type="date"
                        value={experience.exitDate || ''}
                        onChange={(e) => updateWorkExperience(index, 'exitDate', e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <Label>Job Description</Label>
                    <Textarea
                      value={experience.jobDescription || ''}
                      onChange={(e) => updateWorkExperience(index, 'jobDescription', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Achievements</Label>
                    <Textarea
                      value={experience.achievements || ''}
                      onChange={(e) => updateWorkExperience(index, 'achievements', e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Optional Reference Fields */}
                  <Separator className="my-4" />
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-3">Optional Reference Information</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Employer or Supervisor Name (Optional)</Label>
                        <Input
                          value={experience.employerOrSupervisorName || ''}
                          onChange={(e) => updateWorkExperience(index, 'employerOrSupervisorName', e.target.value)}
                          placeholder="Name of employer or supervisor"
                        />
                      </div>
                      <div>
                        <Label>Official Phone (Optional)</Label>
                        <Input
                          value={experience.officialPhone || ''}
                          onChange={(e) => updateWorkExperience(index, 'officialPhone', e.target.value)}
                          placeholder="Official phone number"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label>Official Email (Optional)</Label>
                      <Input
                        type="email"
                        value={experience.officialEmail || ''}
                        onChange={(e) => updateWorkExperience(index, 'officialEmail', e.target.value)}
                        placeholder="Official email address"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addWorkExperience} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Another Work Experience
              </Button>
            </CardContent>
          </Card>

          {/* Higher Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Higher Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.higherEducations?.map((education, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Higher Education {index + 1}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeHigherEducation(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Institution Name *</Label>
                      <Input
                        value={education.institutionName || ''}
                        onChange={(e) => updateHigherEducation(index, 'institutionName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={education.location || ''}
                        onChange={(e) => updateHigherEducation(index, 'location', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Course of Study *</Label>
                      <Input
                        value={education.courseOfStudy || ''}
                        onChange={(e) => updateHigherEducation(index, 'courseOfStudy', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Qualification *</Label>
                      <Input
                        value={education.qualification || ''}
                        onChange={(e) => updateHigherEducation(index, 'qualification', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Entry Year *</Label>
                      <Input
                        type="number"
                        value={education.entryYear || ''}
                        onChange={(e) => updateHigherEducation(index, 'entryYear', parseInt(e.target.value) || 0)}
                        min="1900"
                        max={new Date().getFullYear()}
                        required
                      />
                    </div>
                    <div>
                      <Label>Graduation Year</Label>
                      <Input
                        type="number"
                        value={education.graduationYear || ''}
                        onChange={(e) => updateHigherEducation(index, 'graduationYear', e.target.value ? parseInt(e.target.value) : undefined)}
                        min="1900"
                        max={new Date().getFullYear() + 10}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addHigherEducation} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Another Higher Education
              </Button>
            </CardContent>
          </Card>

          {/* Secondary & Primary Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Secondary & Primary Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.basicEducations?.map((education, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{education.educationType} Education {index + 1}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeBasicEducation(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>School Name *</Label>
                      <Input
                        value={education.schoolName || ''}
                        onChange={(e) => updateBasicEducation(index, 'schoolName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Education Type *</Label>
                      <Select value={education.educationType} onValueChange={(value) => updateBasicEducation(index, 'educationType', value as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Primary">Primary</SelectItem>
                          <SelectItem value="Secondary">Secondary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Certification</Label>
                      <Input
                        value={education.certification || ''}
                        onChange={(e) => updateBasicEducation(index, 'certification', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Year</Label>
                      <Input
                        type="number"
                        value={education.year || ''}
                        onChange={(e) => updateBasicEducation(index, 'year', e.target.value)}
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addBasicEducation} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Another Education
              </Button>
            </CardContent>
          </Card>

          {/* Professional Memberships */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Professional Memberships
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.professionalMemberships?.map((membership, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Membership {index + 1}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeProfessionalMembership(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Professional Body Name *</Label>
                      <Input
                        value={membership.professionalBodyName || ''}
                        onChange={(e) => updateProfessionalMembership(index, 'professionalBodyName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Year of Joining</Label>
                      <Input
                        type="number"
                        value={membership.yearOfJoining || ''}
                        onChange={(e) => updateProfessionalMembership(index, 'yearOfJoining', e.target.value)}
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addProfessionalMembership} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Another Membership
              </Button>
            </CardContent>
          </Card>

          {/* Training & Certification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Training & Certification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.trainingCertifications?.map((certification, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Certification {index + 1}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeTrainingCertification(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Training Organization *</Label>
                      <Input
                        value={certification.trainingOrganization || ''}
                        onChange={(e) => updateTrainingCertification(index, 'trainingOrganization', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Certification Name *</Label>
                      <Input
                        value={certification.certificationName || ''}
                        onChange={(e) => updateTrainingCertification(index, 'certificationName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Date of Certification</Label>
                    <Input
                      type="date"
                      value={certification.dateOfCertification || ''}
                      onChange={(e) => updateTrainingCertification(index, 'dateOfCertification', e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addTrainingCertification} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Another Certification
              </Button>
            </CardContent>
          </Card>

          {/* NYSC Status */}
          <Card>
            <CardHeader>
              <CardTitle>NYSC Certification Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={profile.nyscStatus} onValueChange={(value) => setProfile(prev => ({ ...prev, nyscStatus: value as any }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select NYSC status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Ongoing">Ongoing</SelectItem>
                  <SelectItem value="Exempted">Exempted</SelectItem>
                  <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                  <SelectItem value="Foreigner">Foreigner</SelectItem>
                </SelectContent>
              </Select>
              
              {profile.nyscStatus === 'Completed' && (
                <div>
                  <Label htmlFor="nyscCompletionDate">NYSC Completion Date *</Label>
                  <Input
                    id="nyscCompletionDate"
                    type="date"
                    value={profile.nyscCompletionDate || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, nyscCompletionDate: e.target.value }))}
                    required
                    className="mt-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reference Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Reference Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.referenceDetails?.map((reference, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Reference {index + 1}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeReferenceDetail(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Referee Name *</Label>
                      <Input
                        value={reference.refereeName || ''}
                        onChange={(e) => updateReferenceDetail(index, 'refereeName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Occupation</Label>
                      <Input
                        value={reference.occupation || ''}
                        onChange={(e) => updateReferenceDetail(index, 'occupation', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={reference.location || ''}
                        onChange={(e) => updateReferenceDetail(index, 'location', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Contact Number</Label>
                      <Input
                        value={reference.contactNumber || ''}
                        onChange={(e) => updateReferenceDetail(index, 'contactNumber', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={reference.emailAddress || ''}
                      onChange={(e) => updateReferenceDetail(index, 'emailAddress', e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addReferenceDetail} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Another Reference
              </Button>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-between items-center pt-6">
            <Link href="/dashboard/professional-career-profile/view">
              <Button variant="outline">
                Preview
              </Button>
            </Link>
            <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 