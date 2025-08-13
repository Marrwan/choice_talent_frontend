'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/lib/useToast';
import { useAuth } from '@/lib/store';
import { professionalCareerProfileService } from '@/services/professionalCareerProfileService';
import { jobHuntingSettingsService } from '@/services/jobHuntingSettingsService';
import jobSubscriptionService from '@/services/jobSubscriptionService';
import { userService } from '@/services/userService';
import { getFullImageUrl } from '@/lib/utils';
import { 
  User, 
  Briefcase, 
  Download, 
  Search, 
  Activity, 
  Settings, 
  Crown,
  FileText,
  Award,
  GraduationCap,
  Users,
  TrendingUp,
  Eye,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const toast = useToast();
  const router = useRouter();
  const { user, logout, refreshUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [jobSettings, setJobSettings] = useState<any>(null);
  const [subscriptionEligibility, setSubscriptionEligibility] = useState<any>(null);
  const [stats, setStats] = useState({
    profileComplete: 0,
    jobApplications: 0,
    interviews: 0,
    offers: 0
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadDashboardData();
  }, [user, isAuthenticated, router]);

  // Ensure user data is refreshed when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && !user) {
      refreshUser();
    }
  }, [isAuthenticated, user, refreshUser]);

  // Update userProfile when user changes
  useEffect(() => {
    if (user) {
      setUserProfile(user);
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Always refresh user data to ensure we have the latest information
      if (user) {
        setUserProfile(user);
      } else {
        await refreshUser();
        // The user state will be updated after refreshUser
      }
      
      // Load professional profile
      const profileResponse = await professionalCareerProfileService.getProfile();
      if (profileResponse.success && profileResponse.data.profile) {
        setProfile(profileResponse.data.profile);
      }

      // Load job hunting settings
      const jobResponse = await jobHuntingSettingsService.getSettings();
      if (jobResponse.success && jobResponse.data.settings) {
        setJobSettings(jobResponse.data.settings);
      }

      // Load subscription eligibility
      try {
        const eligibilityResponse = await jobSubscriptionService.checkEligibility();
        setSubscriptionEligibility(eligibilityResponse);
      } catch (error) {
        console.log('User not eligible for subscription yet');
      }

      // Calculate stats
      calculateStats();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.showError('Failed to load dashboard data', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    let profileComplete = 0;
    
    if (profile) {
      const fields = [
        profile.fullName,
        profile.email,
        profile.phoneNumber,
        profile.dateOfBirth,
        profile.gender,
        profile.maritalStatus,
        profile.nationality,
        profile.stateOfOrigin,
        profile.lga,
        profile.address,
        profile.professionalSummary,
        profile.professionalPersona,
        profile.workExperiences?.length > 0,
        profile.basicEducation?.length > 0,
        profile.higherEducation?.length > 0,
        profile.trainingCertifications?.length > 0,
        profile.professionalMemberships?.length > 0,
        profile.referenceDetails?.length > 0
      ];
      
      const completedFields = fields.filter(Boolean).length;
      profileComplete = Math.round((completedFields / fields.length) * 100);
    }

    setStats({
      profileComplete,
      jobApplications: 0, // Placeholder
      interviews: 0, // Placeholder
      offers: 0 // Placeholder
    });
  };

  const getCompletionPercentage = () => {
    if (!profile) return 0;
    
    const fields = [
      profile.fullName,
      profile.email,
      profile.phoneNumber,
      profile.dateOfBirth,
      profile.gender,
      profile.maritalStatus,
      profile.nationality,
      profile.stateOfOrigin,
      profile.lga,
      profile.address,
      profile.professionalSummary,
      profile.professionalPersona,
      profile.workExperiences?.length > 0,
      profile.basicEducation?.length > 0,
      profile.higherEducation?.length > 0,
      profile.trainingCertifications?.length > 0,
      profile.professionalMemberships?.length > 0,
      profile.referenceDetails?.length > 0
    ];
    
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const getMissingFields = () => {
    if (!profile) return [];
    
    const fieldMappings = [
      { field: 'Full Name', value: profile.fullName },
      { field: 'Email', value: profile.email },
      { field: 'Phone Number', value: profile.phoneNumber },
      { field: 'Date of Birth', value: profile.dateOfBirth },
      { field: 'Gender', value: profile.gender },
      { field: 'Marital Status', value: profile.maritalStatus },
      { field: 'Nationality', value: profile.nationality },
      { field: 'State of Origin', value: profile.stateOfOrigin },
      { field: 'LGA', value: profile.lga },
      { field: 'Address', value: profile.address },
      { field: 'Professional Summary', value: profile.professionalSummary },
      { field: 'Professional Persona', value: profile.professionalPersona },
      { field: 'Work Experience', value: profile.workExperiences?.length > 0 },
      { field: 'Basic Education', value: profile.basicEducation?.length > 0 },
      { field: 'Higher Education', value: profile.higherEducation?.length > 0 },
      { field: 'Training & Certifications', value: profile.trainingCertifications?.length > 0 },
      { field: 'Professional Memberships', value: profile.professionalMemberships?.length > 0 },
      { field: 'References', value: profile.referenceDetails?.length > 0 }
    ];
    
    return fieldMappings.filter(item => !item.value).map(item => ({ field: item.field }));
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.realName || user?.name || 'User'}!
          </h2>
          <p className="text-gray-600">Manage your career profile and job hunting activities</p>
        </div>

        {/* Profile Completion Indicator */}
        {profile && getCompletionPercentage() < 100 && (
          <Card className="border-yellow-200 bg-yellow-50 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-800">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Profile Completion: {getCompletionPercentage()}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700 text-sm mb-3">
                Complete your profile to unlock all features. Here's what's missing:
              </p>
              <div className="space-y-2">
                {getMissingFields().slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-yellow-800">{item.field}</span>
                    <Link href="/dashboard/professional-career-profile/edit">
                      <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                        Complete
                      </Button>
                    </Link>
                  </div>
                ))}
                {getMissingFields().length > 5 && (
                  <div className="text-yellow-700 text-xs mt-2">
                    +{getMissingFields().length - 5} more fields to complete
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Profile Complete</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.profileComplete}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.jobApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Interviews</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.interviews}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Offers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.offers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/dashboard/professional-career-profile/edit" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">Edit Profile</h3>
                    <p className="text-sm text-gray-600">Update your professional information</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/professional-career-profile/view" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Eye className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">View Resume</h3>
                    <p className="text-sm text-gray-600">Preview and download your resume</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/job-hunting-settings" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Search className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">Job Preferences</h3>
                    <p className="text-sm text-gray-600">Set your job hunting preferences</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/subscription" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Crown className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">Subscription</h3>
                    <p className="text-sm text-gray-600">Manage your premium subscription</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/job-subscription" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Briefcase className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">Job Subscription</h3>
                    <p className="text-sm text-gray-600">Track job applications and activities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* <Link href="/dashboard/chat" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Activity className="h-6 w-6 text-pink-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">Messages</h3>
                    <p className="text-sm text-gray-600">View your conversations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link> */}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Profile Updated</p>
                    <p className="text-sm text-gray-600">Your professional profile was updated</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">2 hours ago</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Plus className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">New Feature Available</p>
                    <p className="text-sm text-gray-600">Job hunting preferences are now available</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}