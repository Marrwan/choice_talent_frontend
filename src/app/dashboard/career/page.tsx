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
  LogOut, 
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

export default function CareerDashboardPage() {
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
    loadDashboardData();
  }, [user]);

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
        // User not eligible, that's okay
        setSubscriptionEligibility({ isEligible: false });
      }

      // Calculate profile completion percentage
      if (profileResponse.success && profileResponse.data.profile) {
        const profileData = profileResponse.data.profile;
        const fields = [
          profileData.fullName,
          profileData.gender,
          profileData.dateOfBirth,
          profileData.phoneNumber,
          profileData.emailAddress,
          profileData.address,
          profileData.lgaOfResidence,
          profileData.stateOfResidence,
          profileData.professionalSummary,
          profileData.persona,
          (profileData.expertiseCompetencies?.length || 0) > 0,
          (profileData.softwareSkills?.length || 0) > 0,
          (profileData.workExperiences?.length || 0) > 0,
          (profileData.higherEducations?.length || 0) > 0,
          (profileData.basicEducations?.length || 0) > 0,
          (profileData.professionalMemberships?.length || 0) > 0,
          (profileData.trainingCertifications?.length || 0) > 0,
          profileData.nyscStatus,
          (profileData.referenceDetails?.length || 0) > 0
        ];
        
        const completedFields = fields.filter(Boolean).length;
        setStats(prev => ({
          ...prev,
          profileComplete: Math.round((completedFields / fields.length) * 100)
        }));
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.showSuccess('Logged out successfully', 'Success');
  };

  const handleDownloadProfile = () => {
    // Check if profile is complete
    if (stats.profileComplete < 100) {
      toast.showError('Please complete your career profile before downloading', 'Profile Incomplete');
      return;
    }
    
    // Redirect to payment page
    router.push('/dashboard/career/resume-payment');
  };

  const handleProfilePictureClick = () => {
    setShowProfileModal(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleProfilePictureUpload(file);
    }
  };

  const handleProfilePictureUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await userService.uploadCareerProfilePicture(formData);
      if (response.success) {
        toast.showSuccess('Profile picture updated successfully!', 'Success');
        
        // Refresh user data in auth store to get the updated profile picture
        await refreshUser();
      } else {
        toast.showError(response.message || 'Failed to update profile picture', 'Error');
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
      toast.showError('Failed to update profile picture', 'Error');
    }
    setShowProfileModal(false);
  };

  const handleDeleteProfilePicture = async () => {
    try {
      const response = await userService.deleteCareerProfilePicture();
      if (response.success) {
        toast.showSuccess('Profile picture deleted successfully!', 'Success');
        
        // Refresh user data in auth store to reflect the deletion
        await refreshUser();
      } else {
        toast.showError(response.message || 'Failed to delete profile picture', 'Error');
      }
    } catch (error) {
      console.error('Profile picture deletion error:', error);
      toast.showError('Failed to delete profile picture', 'Error');
    }
    setShowProfileModal(false);
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
      (profile.expertiseCompetencies?.length || 0) > 0,
      (profile.softwareSkills?.length || 0) > 0,
      (profile.workExperiences?.length || 0) > 0,
      (profile.higherEducations?.length || 0) > 0,
      (profile.basicEducations?.length || 0) > 0,
      (profile.professionalMemberships?.length || 0) > 0,
      (profile.trainingCertifications?.length || 0) > 0,
      profile.nyscStatus,
      (profile.referenceDetails?.length || 0) > 0
    ];
    
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const getMissingFields = () => {
    if (!profile) return [];
    
    const missingFields = [];
    
    if (!profile.fullName) missingFields.push({ field: 'Full Name', section: 'Personal Information' });
    if (!profile.gender) missingFields.push({ field: 'Gender', section: 'Personal Information' });
    if (!profile.dateOfBirth) missingFields.push({ field: 'Date of Birth', section: 'Personal Information' });
    if (!profile.phoneNumber) missingFields.push({ field: 'Phone Number', section: 'Contact Information' });
    if (!profile.emailAddress) missingFields.push({ field: 'Email Address', section: 'Contact Information' });
    if (!profile.address) missingFields.push({ field: 'Address', section: 'Contact Information' });
    if (!profile.lgaOfResidence) missingFields.push({ field: 'LGA of Residence', section: 'Contact Information' });
    if (!profile.stateOfResidence) missingFields.push({ field: 'State of Residence', section: 'Contact Information' });
    if (!profile.professionalSummary) missingFields.push({ field: 'Professional Summary', section: 'Professional Information' });
    if (!profile.persona) missingFields.push({ field: 'Persona', section: 'Professional Information' });
    if (!profile.expertiseCompetencies?.length) missingFields.push({ field: 'Areas of Expertise', section: 'Skills' });
    if (!profile.softwareSkills?.length) missingFields.push({ field: 'Software Skills', section: 'Skills' });
    if (!profile.workExperiences?.length) missingFields.push({ field: 'Work Experience', section: 'Experience' });
    if (!profile.higherEducations?.length) missingFields.push({ field: 'Higher Education', section: 'Education' });
    if (!profile.basicEducations?.length) missingFields.push({ field: 'Basic Education', section: 'Education' });
    if (!profile.professionalMemberships?.length) missingFields.push({ field: 'Professional Memberships', section: 'Memberships' });
    if (!profile.trainingCertifications?.length) missingFields.push({ field: 'Training & Certifications', section: 'Certifications' });
    if (!profile.nyscStatus) missingFields.push({ field: 'NYSC Status', section: 'Certifications' });
    if (!profile.referenceDetails?.length) missingFields.push({ field: 'Reference Details', section: 'References' });
    
    return missingFields;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading career dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Career Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back, {user?.name || 'User'}!</p>
            </div>
            <div className="flex items-center gap-2">
              {user?.isPremium && (
                <Badge variant="default" className="flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Premium
                </Badge>
              )}
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Info & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  User Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={handleProfilePictureClick}
                  >
                    {userProfile?.careerProfilePicture ? (
                      <img
                        src={getFullImageUrl(userProfile.careerProfilePicture)}
                        alt="Profile"
                        className="w-16 h-16 object-cover rounded-full"
                        onError={(e) => {
                          console.error('[Career Dashboard] Image failed to load:', userProfile.careerProfilePicture);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user?.name || 'User'}</h3>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                    <Badge variant={user?.isPremium ? 'default' : 'secondary'} className="mt-1">
                      {user?.isPremium ? 'Premium Plan' : 'Free Plan'}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Profile Complete</span>
                    <span className="text-sm font-medium">{stats.profileComplete}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${stats.profileComplete}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/professional-career-profile" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Career Profile
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full justify-start" onClick={handleDownloadProfile}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Profile
                </Button>
                
                <Link href="/dashboard/job-hunting-settings" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="mr-2 h-4 w-4" />
                    Job Hunting
                  </Button>
                </Link>
                
                <Link href="/dashboard/subscription" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Crown className="mr-2 h-4 w-4" />
                    Subscription
                  </Button>
                </Link>
                
                <Link href="/dashboard/career/activities" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="mr-2 h-4 w-4" />
                    Track Activities
                  </Button>
                </Link>
                
                <Link href="/dashboard/career/settings" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Career Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Profile Completion Indicator */}
            {profile && getCompletionPercentage() < 100 && (
              <Card className="border-yellow-200 bg-yellow-50">
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
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Career Profile Overview */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Briefcase className="mr-2 h-5 w-5" />
                    Career Profile Overview
                  </CardTitle>
                  <Link href="/dashboard/professional-career-profile">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Full Profile
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {profile ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      {profile.profilePicture ? (
                        <img
                          src={getFullImageUrl(profile.profilePicture)}
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
                        <p className="text-gray-600 mb-3">{profile.professionalSummary}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center">
                            <Briefcase className="mr-2 h-4 w-4 text-gray-400" />
                            <span>{profile.workExperiences?.length || 0} Experience</span>
                          </div>
                          <div className="flex items-center">
                            <GraduationCap className="mr-2 h-4 w-4 text-gray-400" />
                            <span>{profile.higherEducations?.length || 0} Education</span>
                          </div>
                          <div className="flex items-center">
                            <Award className="mr-2 h-4 w-4 text-gray-400" />
                            <span>{profile.trainingCertifications?.length || 0} Certifications</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-gray-400" />
                            <span>{profile.referenceDetails?.length || 0} References</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Career Profile</h3>
                    <p className="text-gray-600 mb-4">Create your professional career profile to get started.</p>
                    <Link href="/dashboard/professional-career-profile/edit">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Profile
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Hunting Status */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Search className="mr-2 h-5 w-5" />
                    Job Hunting Status
                  </CardTitle>
                  <Link href="/dashboard/job-hunting-settings">
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {jobSettings ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Career Category</h4>
                        <Badge variant="outline">{jobSettings.careerCategory}</Badge>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Experience Level</h4>
                        <Badge variant="outline">{jobSettings.totalYearsOfWorkExperience}</Badge>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Job Types</h4>
                      <div className="flex flex-wrap gap-1">
                        {jobSettings.jobTypes?.map((type: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Preferred Locations</h4>
                      <div className="flex flex-wrap gap-1">
                        {jobSettings.preferredLocations?.slice(0, 3).map((location: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {location}
                          </Badge>
                        ))}
                        {jobSettings.preferredLocations?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{jobSettings.preferredLocations.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                      <Search className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Job Preferences Set</h3>
                    <p className="text-gray-600 mb-4">Configure your job hunting preferences to get relevant opportunities.</p>
                    <Link href="/dashboard/job-hunting-settings">
                      <Button>
                        <Settings className="mr-2 h-4 w-4" />
                        Set Preferences
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Crown className="mr-2 h-5 w-5" />
                    Subscription Status
                  </CardTitle>
                  {subscriptionEligibility && (
                    <Link href="/dashboard/job-subscription">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View Subscriptions
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {subscriptionEligibility?.hasActiveSubscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <h3 className="font-semibold text-green-700">Active Subscription</h3>
                        <p className="text-sm text-gray-600">
                          {subscriptionEligibility.activeSubscription.subscriptionType.replace('_', ' ').replace('-', ' ')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Start Date:</span>
                        <p className="font-medium">
                          {new Date(subscriptionEligibility.activeSubscription.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">End Date:</span>
                        <p className="font-medium">
                          {new Date(subscriptionEligibility.activeSubscription.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <h4 className="font-medium text-gray-900 mb-2">Your Benefits:</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Career advisory
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Profile screening
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Job application feedback
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Profile assessment feedback
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Profile forwarding to employers
                        </li>
                      </ul>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href="/dashboard/job-subscription/activity">
                        <Button variant="outline" size="sm">
                          <Activity className="mr-2 h-4 w-4" />
                          View Activity
                        </Button>
                      </Link>
                      <Link href="/dashboard/job-subscription">
                        <Button size="sm">
                          <Crown className="mr-2 h-4 w-4" />
                          Manage Subscription
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : subscriptionEligibility?.isEligible ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <div>
                        <h3 className="font-semibold text-yellow-700">No Active Subscription</h3>
                        <p className="text-sm text-gray-600">
                          You're eligible for subscription services
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <h4 className="font-medium text-gray-900 mb-2">Available Benefits:</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Career advisory
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Profile screening
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Job application feedback
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Profile assessment feedback
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Profile forwarding to employers
                        </li>
                      </ul>
                    </div>
                    
                    <Link href="/dashboard/job-subscription">
                      <Button className="w-full">
                        <Crown className="mr-2 h-4 w-4" />
                        Get Job Subscription
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <div>
                        <h3 className="font-semibold text-red-700">Not Eligible</h3>
                        <p className="text-sm text-gray-600">
                          Complete requirements to access job subscription
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          {profile ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className={profile ? 'text-gray-600' : 'text-red-600'}>
                            Complete career profile
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          {jobSettings ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className={jobSettings ? 'text-gray-600' : 'text-red-600'}>
                            Set job hunting preferences
                          </span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="flex gap-2">
                      {!profile && (
                        <Link href="/dashboard/professional-career-profile/edit">
                          <Button variant="outline" size="sm">
                            <FileText className="mr-2 h-4 w-4" />
                            Complete Profile
                          </Button>
                        </Link>
                      )}
                      {!jobSettings && (
                        <Link href="/dashboard/job-hunting-settings">
                          <Button variant="outline" size="sm">
                            <Settings className="mr-2 h-4 w-4" />
                            Set Preferences
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Activity Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.jobApplications}</div>
                    <div className="text-sm text-gray-600">Job Applications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.interviews}</div>
                    <div className="text-sm text-gray-600">Interviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.offers}</div>
                    <div className="text-sm text-gray-600">Job Offers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.profileComplete}%</div>
                    <div className="text-sm text-gray-600">Profile Complete</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Profile Picture Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
            
            {userProfile?.careerProfilePicture && (
              <div className="mb-4">
                <img
                  src={getFullImageUrl(userProfile.careerProfilePicture)}
                  alt="Current Profile"
                  className="w-32 h-32 object-cover rounded-full mx-auto"
                />
              </div>
            )}
            
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                Upload New Picture
              </Button>
              
              {userProfile?.careerProfilePicture && (
                <Button
                  variant="outline"
                  onClick={handleDeleteProfilePicture}
                  className="w-full"
                >
                  Remove Picture
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => setShowProfileModal(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 