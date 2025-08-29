'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/lib/useToast';
import { useAuth } from '@/lib/store';
import { professionalCareerProfileService } from '@/services/professionalCareerProfileService';
import { jobSubscriptionService } from '@/services/jobSubscriptionService';
import { 
  jobHuntingSettingsService, 
  CreateJobHuntingSettingsData,
  JOB_TYPES,
  CAREER_CATEGORIES,
  CATEGORY_OF_POSITIONS,
  YEARS_OF_EXPERIENCE,
  NIGERIAN_STATES,
  SALARY_NEGOTIABLE_OPTIONS
} from '@/services/jobHuntingSettingsService';
import { ArrowLeft, AlertTriangle, Crown } from 'lucide-react';

export default function JobHuntingSettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [settings, setSettings] = useState<CreateJobHuntingSettingsData>({
    jobTypes: [],
    careerCategory: '',
    categoryOfPositions: [],
    totalYearsOfWorkExperience: '',
    preferredLocations: [],
    minimumSalaryExpectation: '',
    workWithProposedPay: true,
    salaryExpectationNegotiable: '',
    searchScope: 'country_only'
  });
  const [salaryCurrency, setSalaryCurrency] = useState<string>('NGN');
  const [salaryAmount, setSalaryAmount] = useState<string>('');
  const [salaryPeriod, setSalaryPeriod] = useState<string>('per annum');

  // Load existing settings and check profile completion
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load profile completion percentage
      const profileResponse = await professionalCareerProfileService.getProfile();
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
        const completionPercentage = Math.round((completedFields / fields.length) * 100);
        setProfileCompletion(completionPercentage);
      }
      
      // Load job hunting settings
      const response = await jobHuntingSettingsService.getSettings();
      
      if (response.success && response.data.settings) {
        const settingsData = response.data.settings;
        // Parse minimum salary expectation into currency and amount if present
        if (settingsData.minimumSalaryExpectation) {
          const text = String(settingsData.minimumSalaryExpectation);
          const match = text.match(/^([A-Z]{3})\s*([0-9.,]+)\s*(per\s+.+)?$/i);
          if (match) {
            setSalaryCurrency(match[1]);
            setSalaryAmount((match[2] || '').trim());
            if (match[3]) setSalaryPeriod(match[3].toLowerCase().trim());
          }
        }
        setSettings({
          jobTypes: settingsData.jobTypes || [],
          careerCategory: settingsData.careerCategory || '',
          categoryOfPositions: settingsData.categoryOfPositions || [],
          totalYearsOfWorkExperience: settingsData.totalYearsOfWorkExperience || '',
          preferredLocations: settingsData.preferredLocations || [],
          minimumSalaryExpectation: settingsData.minimumSalaryExpectation || '',
          workWithProposedPay: typeof settingsData.workWithProposedPay === 'boolean' ? settingsData.workWithProposedPay : true,
          salaryExpectationNegotiable: settingsData.salaryExpectationNegotiable || '',
          searchScope: settingsData.searchScope || 'country_only'
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.showError('Failed to load data', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        ...settings,
        minimumSalaryExpectation: settings.workWithProposedPay
          ? ''
          : `${salaryCurrency} ${salaryAmount} ${salaryPeriod}`.trim()
      };
      const response = await jobHuntingSettingsService.createOrUpdateSettings(payload as CreateJobHuntingSettingsData);
      
      if (response.success) {
        toast.showSuccess('Job hunting settings saved successfully!', 'Success');
      }
    } catch (error) {
      console.error('Error saving job hunting settings:', error);
      toast.showError('Failed to save job hunting settings', 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleActivateAppAI = async () => {
    // Check premium status for AppAI activation
    if ((user as any)?.subscriptionStatus !== 'premium' && !(user as any)?.isPremium) {
      toast.showError('AppAI subscription required. This premium AI-powered service helps optimize your job search and career profile. Please subscribe to continue.', 'Premium Required');
      router.push('/dashboard/subscription');
      return;
    }

    try {
      setSaving(true);
      const response = await jobHuntingSettingsService.createOrUpdateSettings(settings);
      
      if (response.success) {
        toast.showSuccess('Settings saved! Redirecting to AppAI activation...', 'Success');
        
        // Redirect to activation page after a brief delay
        setTimeout(() => {
          router.push('/dashboard/appai/activate');
        }, 1000);
      }
    } catch (error) {
      console.error('Error saving job hunting settings:', error);
      toast.showError('Failed to save settings. Please try again.', 'Error');
    } finally {
      setSaving(false);
    }
  };

  // Multi-select handlers
  const toggleJobType = (jobType: string) => {
    setSettings(prev => ({
      ...prev,
      jobTypes: prev.jobTypes.includes(jobType)
        ? prev.jobTypes.filter(type => type !== jobType)
        : [...prev.jobTypes, jobType]
    }));
  };

  const toggleCategoryOfPosition = (category: string) => {
    setSettings(prev => ({
      ...prev,
      categoryOfPositions: prev.categoryOfPositions.includes(category)
        ? prev.categoryOfPositions.filter(cat => cat !== category)
        : [...prev.categoryOfPositions, category]
    }));
  };

  const togglePreferredLocation = (location: string) => {
    setSettings(prev => ({
      ...prev,
      preferredLocations: prev.preferredLocations.includes(location)
        ? prev.preferredLocations.filter(loc => loc !== location)
        : [...prev.preferredLocations, location]
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading job hunting settings...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Job Hunting Settings</h1>
          <p className="text-gray-600 mt-2">Configure your job preferences and requirements</p>
        </div>

        {/* Profile Completion Check */}
        {profileCompletion < 50 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Profile Completion Required</h3>
                  <p className="text-yellow-700 text-sm mb-3">
                    Your profile is {profileCompletion}% complete. You need at least 50% completion to set job hunting preferences.
                  </p>
                  <Link href="/dashboard/professional-career-profile/edit">
                    <Button variant="outline" size="sm">
                      Complete Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Job Preferences (AppAI)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Scope */}
            <div>
              <Label className="text-base font-medium">Search Scope</Label>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={settings.searchScope === 'country_only' ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => setSettings(prev => ({ ...prev, searchScope: 'country_only' }))}
                >
                  Only within my country
                </Button>
                <Button
                  type="button"
                  variant={settings.searchScope === 'global' ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => setSettings(prev => ({ ...prev, searchScope: 'global' }))}
                >
                  Global opportunities
                </Button>
              </div>
            </div>
            {/* Job Types */}
            <div>
              <Label className="text-base font-medium">Job Type (Multi-select)</Label>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                {JOB_TYPES.map((jobType) => (
                  <div key={jobType} className="flex items-center space-x-2">
                    <Checkbox
                      id={jobType}
                      checked={settings.jobTypes.includes(jobType)}
                      onCheckedChange={() => toggleJobType(jobType)}
                    />
                    <Label htmlFor={jobType} className="text-sm font-normal cursor-pointer">
                      {jobType}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Career Category */}
            <div>
              <Label htmlFor="careerCategory" className="text-base font-medium">Career Category</Label>
              <Select 
                value={settings.careerCategory} 
                onValueChange={(value) => setSettings(prev => ({ ...prev, careerCategory: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select career category" />
                </SelectTrigger>
                <SelectContent>
                  {CAREER_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Category of Positions */}
            <div>
              <Label className="text-base font-medium">Category of Positions (Multi-select)</Label>
              <div className="mt-2 max-h-60 overflow-y-auto border rounded-md p-3">
                <div className="grid grid-cols-1 gap-2">
                  {CATEGORY_OF_POSITIONS.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={settings.categoryOfPositions.includes(category)}
                        onCheckedChange={() => toggleCategoryOfPosition(category)}
                      />
                      <Label htmlFor={category} className="text-sm font-normal cursor-pointer">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              {settings.categoryOfPositions.length > 0 && (
                <div className="mt-2">
                  <Label className="text-sm text-gray-600">Selected ({settings.categoryOfPositions.length}):</Label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {settings.categoryOfPositions.map((category) => (
                      <Badge key={category} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Years of Work Experience */}
            <div>
              <Label htmlFor="experience" className="text-base font-medium">Total Years of Work Experience</Label>
              <Select 
                value={settings.totalYearsOfWorkExperience} 
                onValueChange={(value) => setSettings(prev => ({ ...prev, totalYearsOfWorkExperience: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select years of experience" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS_OF_EXPERIENCE.map((experience) => (
                    <SelectItem key={experience} value={experience}>
                      {experience}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Preferred Locations */}
            <div>
              <Label className="text-base font-medium">Preferred Location (Multi-select)</Label>
              <div className="mt-2 max-h-60 overflow-y-auto border rounded-md p-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {NIGERIAN_STATES.map((state) => (
                    <div key={state} className="flex items-center space-x-2">
                      <Checkbox
                        id={state}
                        checked={settings.preferredLocations.includes(state)}
                        onCheckedChange={() => togglePreferredLocation(state)}
                      />
                      <Label htmlFor={state} className="text-sm font-normal cursor-pointer">
                        {state}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              {settings.preferredLocations.length > 0 && (
                <div className="mt-2">
                  <Label className="text-sm text-gray-600">Selected ({settings.preferredLocations.length}):</Label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {settings.preferredLocations.map((location) => (
                      <Badge key={location} variant="secondary" className="text-xs">
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Salary Expectations */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="salaryExpectation" className="text-base font-medium">Minimum Salary Expectation</Label>
                <div className="mt-2 grid grid-cols-6 gap-2 max-w-2xl items-center">
                  <Select
                    value={salaryCurrency}
                    onValueChange={(value) => {
                      setSalaryCurrency(value);
                      setSettings(prev => ({ ...prev, minimumSalaryExpectation: `${value} ${salaryAmount} ${salaryPeriod}`.trim() }));
                    }}
                    disabled={settings.workWithProposedPay}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        'AED','ARS','AUD','BDT','BGN','BRL','BYN','CAD','CHF','CLP','COP','CRC','CZK','DKK','EGP','EUR','GBP','GTQ','HKD','HNL','HUF','IDR','ILS','INR','JOD','JPY','KES','KRW','KWD','LBP','LKR','MAD','MXN','MYR','NGN','NOK','NZD','PEN','PHP','PKR','PLN','QAR','RON','RSD','RUB','SAR','SEK','SGD','THB','TRY','TWD','TZS','UAH','USD','UYU','VND','XOF','ZAR'
                      ].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={salaryAmount}
                    onChange={(e) => {
                      setSalaryAmount(e.target.value);
                      setSettings(prev => ({ ...prev, minimumSalaryExpectation: `${salaryCurrency} ${e.target.value} ${salaryPeriod}`.trim() }));
                    }}
                    placeholder="Amount"
                    className="col-span-3"
                    disabled={settings.workWithProposedPay}
                  />
                  <Select
                    value={salaryPeriod}
                    onValueChange={(value) => {
                      setSalaryPeriod(value);
                      setSettings(prev => ({ ...prev, minimumSalaryExpectation: `${salaryCurrency} ${salaryAmount} ${value}`.trim() }));
                    }}
                    disabled={settings.workWithProposedPay}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                      {['per hour','per week','per month','per year','per annum'].map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="workWithProposedPay"
                  checked={settings.workWithProposedPay}
                  onCheckedChange={(checked) => setSettings(prev => ({ 
                    ...prev, 
                    workWithProposedPay: checked as boolean,
                    minimumSalaryExpectation: checked ? '' : `${salaryCurrency} ${salaryAmount} ${salaryPeriod}`.trim()
                  }))}
                />
                <Label htmlFor="workWithProposedPay" className="text-sm font-normal cursor-pointer">
                  I will work with the proposed pay of the employer
                </Label>
              </div>

              <div>
                <Label htmlFor="negotiable" className="text-base font-medium">Is Your Salary Expectation Negotiable?</Label>
                <Select 
                  value={settings.salaryExpectationNegotiable} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, salaryExpectationNegotiable: value }))}
                  disabled={settings.workWithProposedPay}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    {SALARY_NEGOTIABLE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option} disabled={settings.workWithProposedPay && option === 'Yes'}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Subscription Notice */}
            {(!user?.subscriptionStatus || user.subscriptionStatus === 'free') && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Crown className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-2">Subscription Required</h3>
                      <p className="text-blue-700 text-sm mb-3">
                        After saving your job hunting settings, you'll need a premium subscription to access job hunting features like profile forwarding and employer matching.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Save & Activate */}
            <div className="flex justify-between items-center">
              <Button 
                variant="outline"
                onClick={handleActivateAppAI}
                disabled={saving || profileCompletion < 50}
              >
                {saving ? 'Saving...' : 'Activate AppAI'}
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving || profileCompletion < 50}
                className="px-8"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 