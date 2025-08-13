'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/lib/useToast';
import { professionalCareerProfileService } from '@/services/professionalCareerProfileService';
import { Eye, Edit, Plus, User, Briefcase, GraduationCap, Award, Users, FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfessionalCareerProfilePage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await professionalCareerProfileService.getProfile();
      
      if (response.success && response.data.profile) {
        setProfile(response.data.profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionPercentage = () => {
    if (!profile) return 0;
    
    const fields = [
      profile.fullName,
      profile.gender,
      profile.dateOfBirth,
      profile.phoneNumber,
      profile.emailAddress,
      profile.address,
      profile.lgaOfResidence,
      profile.stateOfResidence,
      profile.professionalSummary,
      profile.persona,
      profile.expertiseCompetencies?.length > 0,
      profile.softwareSkills?.length > 0,
      profile.workExperiences?.length > 0,
      profile.higherEducations?.length > 0,
      profile.basicEducations?.length > 0,
      profile.professionalMemberships?.length > 0,
      profile.trainingCertifications?.length > 0,
      profile.nyscStatus,
      profile.referenceDetails?.length > 0
    ];
    
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading profile...</p>
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
            href="/dashboard/career" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Professional Career Profile</h1>
          <p className="text-gray-600 mt-2">Manage your professional career information</p>
        </div>

        {profile ? (
          <>
            {/* Profile Overview */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Profile Overview
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Your professional career profile</p>
                  </div>
                  <Badge variant={getCompletionPercentage() === 100 ? 'default' : 'secondary'}>
                    {getCompletionPercentage()}% Complete
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt="Profile"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <User className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{profile.fullName}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Briefcase className="mr-2 h-4 w-4" />
                        {profile.workExperiences?.length || 0} Work Experience{profile.workExperiences?.length !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        {profile.higherEducations?.length || 0} Education{profile.higherEducations?.length !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center">
                        <Award className="mr-2 h-4 w-4" />
                        {profile.trainingCertifications?.length || 0} Certification{profile.trainingCertifications?.length !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        {profile.referenceDetails?.length || 0} Reference{profile.referenceDetails?.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <Link href="/dashboard/professional-career-profile/view" className="flex-1">
                <Button className="w-full" variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  View Profile
                </Button>
              </Link>
              <Link href="/dashboard/professional-career-profile/edit" className="flex-1">
                <Button className="w-full">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
            </div>

            {/* Profile Sections Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Basic Details</span>
                    {profile.fullName && profile.gender && profile.dateOfBirth ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Contact Information</span>
                    {profile.phoneNumber && profile.emailAddress ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Address</span>
                    {profile.address && profile.lgaOfResidence && profile.stateOfResidence ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Professional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Summary & Persona</span>
                    {profile.professionalSummary && profile.persona ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Skills & Expertise</span>
                    {profile.expertiseCompetencies?.length > 0 && profile.softwareSkills?.length > 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Work Experience</span>
                    {profile.workExperiences?.length > 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Education</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Higher Education</span>
                    {profile.higherEducations?.length > 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Basic Education</span>
                    {profile.basicEducations?.length > 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">NYSC Status</span>
                    {profile.nyscStatus ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Professional Memberships</span>
                    {profile.professionalMemberships?.length > 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Training & Certifications</span>
                    {profile.trainingCertifications?.length > 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">References</span>
                    {profile.referenceDetails?.length > 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          /* No Profile Found */
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Professional Career Profile</h2>
                <p className="text-gray-600 mb-6">
                  You haven&apos;t created your professional career profile yet. Create one to showcase your skills, experience, and qualifications.
                </p>
                <Link href="/dashboard/professional-career-profile/edit">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}