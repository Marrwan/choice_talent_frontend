'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/lib/useToast';
import jobSubscriptionService, { JobActivityLog } from '@/services/jobSubscriptionService';
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertTriangle, Building2, Calendar, Briefcase, Search, Crown, Activity, TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/store';
import { professionalCareerProfileService } from '@/services/professionalCareerProfileService';
import { jobHuntingSettingsService } from '@/services/jobHuntingSettingsService';
import Link from 'next/link';

export default function ActivityLogPage() {
  const router = useRouter();
  const { showError } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState<JobActivityLog[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [jobSettings, setJobSettings] = useState<any>(null);
  const [subscriptionEligibility, setSubscriptionEligibility] = useState<any>(null);
  const [stats, setStats] = useState({
    profileComplete: 0,
    jobApplications: 0,
    interviews: 0,
    offers: 0
  });

  useEffect(() => {
    loadActivityLogs();
    loadDashboardData();
  }, []);

  const loadActivityLogs = async () => {
    try {
      setLoading(true);
      const logs = await jobSubscriptionService.getActivityLogs();
      setActivityLogs(logs);
    } catch (error) {
      console.error('Error loading activity logs:', error);
      showError('Failed to load activity logs', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
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
        setSubscriptionEligibility({ isEligible: false });
      }

      // Calculate profile completion percentage
      if (profileResponse.success && profileResponse.data.profile) {
        const profileData = profileResponse.data.profile;
        const fields = [
          profileData.firstName && profileData.lastName ? `${profileData.firstName} ${profileData.lastName}` : null,
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
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Profile Forwarding Activity</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Track where and when your profile was forwarded, and the status of each activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : activityLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No activity logs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {activityLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-2 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-500" />
                        {log.companyName || 'N/A'}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <Badge variant={log.status === 'completed' ? 'default' : 'secondary'}>
                            {log.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Moved Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
        {/* Career Profile Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5" />
                Career Profile Overview
              </CardTitle>
              <Link href="/dashboard/professional-career-profile">
                <Button variant="outline" size="sm">View</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {profile ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  {profile.professionalSummary || 'I have about 5 years of experience in management...'}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-medium">{profile.workExperiences?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Certifications</span>
                  <span className="font-medium">{profile.trainingCertifications?.length || 0}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No profile data available</p>
            )}
          </CardContent>
        </Card>

        {/* Job Hunting Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Search className="mr-2 h-5 w-5" />
                Job Hunting Status
              </CardTitle>
              <Link href="/dashboard/job-hunting-settings">
                <Button variant="outline" size="sm">Edit</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {jobSettings ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Career Category</span>
                  <Badge variant="outline">{jobSettings.careerCategory || 'Not set'}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Job Types</span>
                  <div className="flex gap-1">
                    {jobSettings.jobTypes?.map((type: string) => (
                      <Badge key={type} variant="outline" className="text-xs">{type}</Badge>
                    )) || <span className="text-gray-500">Not set</span>}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Preferred Locations</span>
                  <div className="flex gap-1">
                    {jobSettings.preferredLocations?.slice(0, 2).map((location: string) => (
                      <Badge key={location} variant="outline" className="text-xs">{location}</Badge>
                    )) || <span className="text-gray-500">Not set</span>}
                    {jobSettings.preferredLocations?.length > 2 && (
                      <Badge variant="outline" className="text-xs">+{jobSettings.preferredLocations.length - 2} more</Badge>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No job hunting settings available</p>
            )}
          </CardContent>
        </Card>

        {/* Premium Subscription */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Crown className="mr-2 h-5 w-5" />
                Premium Subscription
              </CardTitle>
              {subscriptionEligibility && (
                <Button
                  variant={subscriptionEligibility.isEligible ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => router.push('/dashboard/subscription')}
                >
                  {subscriptionEligibility.isEligible ? 'Upgrade' : 'Manage'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {subscriptionEligibility ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <Badge variant={subscriptionEligibility.isEligible ? 'default' : 'secondary'}>
                    {subscriptionEligibility.isEligible ? 'Eligible' : 'Not Eligible'}
                  </Badge>
                </div>
                {subscriptionEligibility.isEligible && (
                  <p className="text-sm text-gray-600">
                    Upgrade to Premium to access advanced features and priority support.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Subscription status unavailable</p>
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
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Profile Complete</span>
                <span className="font-medium">{stats.profileComplete}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${stats.profileComplete}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Job Applications</span>
                <span className="font-medium">{stats.jobApplications}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Interviews</span>
                <span className="font-medium">{stats.interviews}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Offers</span>
                <span className="font-medium">{stats.offers}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}