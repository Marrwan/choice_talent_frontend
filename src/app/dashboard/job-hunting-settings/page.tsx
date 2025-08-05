'use client';

import { useState, useEffect } from 'react';
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

export default function JobHuntingSettingsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<CreateJobHuntingSettingsData>({
    jobTypes: [],
    careerCategory: '',
    categoryOfPositions: [],
    totalYearsOfWorkExperience: '',
    preferredLocations: [],
    minimumSalaryExpectation: '',
    workWithProposedPay: false,
    salaryExpectationNegotiable: ''
  });

  // Load existing settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await jobHuntingSettingsService.getSettings();
      
      if (response.success && response.data.settings) {
        const settingsData = response.data.settings;
        setSettings({
          jobTypes: settingsData.jobTypes || [],
          careerCategory: settingsData.careerCategory || '',
          categoryOfPositions: settingsData.categoryOfPositions || [],
          totalYearsOfWorkExperience: settingsData.totalYearsOfWorkExperience || '',
          preferredLocations: settingsData.preferredLocations || [],
          minimumSalaryExpectation: settingsData.minimumSalaryExpectation || '',
          workWithProposedPay: settingsData.workWithProposedPay || false,
          salaryExpectationNegotiable: settingsData.salaryExpectationNegotiable || ''
        });
      }
    } catch (error) {
      console.error('Error loading job hunting settings:', error);
      toast.showError('Failed to load job hunting settings', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await jobHuntingSettingsService.createOrUpdateSettings(settings);
      
      if (response.success) {
        toast.showSuccess(response.message || 'Job hunting settings saved successfully', 'Success');
      }
    } catch (error) {
      console.error('Error saving job hunting settings:', error);
      toast.showError('Failed to save job hunting settings', 'Error');
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Job Hunting Settings</h1>
          <p className="text-gray-600 mt-2">Configure your job preferences and requirements</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
                <Input
                  id="salaryExpectation"
                  value={settings.minimumSalaryExpectation}
                  onChange={(e) => setSettings(prev => ({ ...prev, minimumSalaryExpectation: e.target.value }))}
                  placeholder="e.g., ₦500,000 per month"
                  className="mt-2"
                  disabled={settings.workWithProposedPay}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="workWithProposedPay"
                  checked={settings.workWithProposedPay}
                  onCheckedChange={(checked) => setSettings(prev => ({ 
                    ...prev, 
                    workWithProposedPay: checked as boolean,
                    minimumSalaryExpectation: checked ? '' : prev.minimumSalaryExpectation
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
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    {SALARY_NEGOTIABLE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={saving}
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