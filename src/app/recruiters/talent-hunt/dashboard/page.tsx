'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { recruiterService } from '@/services/recruiterService';
import { useToast } from '@/lib/useToast';
import { 
  Home, 
  Briefcase, 
  Users, 
  Star,
  Calendar,
  Settings,
  Building,
  MapPin,
  TrendingUp,
  Search,
  Filter,
  Info,
  Plus
} from 'lucide-react';

export default function TalentHuntDashboardPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [activeSection, setActiveSection] = useState<string>('about');
  const [flowStep, setFlowStep] = useState<'about' | 'company' | 'job' | 'dashboard'>('about');
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalMatches: 0,
    shortlistedCandidates: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load recruiter profile
      const profileRes = await recruiterService.getProfile();
      if (profileRes?.success) {
        const profileData = profileRes.data?.profile;
        setProfile(profileData);
      }

      // Load talent hunt jobs
      const res = await recruiterService.listJobs();
      if (res?.success) {
        const jobsList = res.data?.jobs || [];
        setJobs(jobsList);
        setStats({
          totalJobs: jobsList.length,
          activeJobs: jobsList.filter(j => j.status === 'published').length,
          totalMatches: 0, // Will be calculated from matches
          shortlistedCandidates: 0 // Will be calculated from shortlists
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = () => {
    setActiveSection('create-job');
  };

  const handleViewMatches = (jobId: string) => {
    router.push(`/recruiters/talent-hunt/job/${jobId}/matches`);
  };

  const handleViewShortlist = (jobId: string) => {
    router.push(`/recruiters/talent-hunt/job/${jobId}/shortlist`);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <NavigationHeader title="Talent Hunt" />
        
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Company Profile & Navigation */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Company Profile Card */}
            <Card>
              <CardContent className="space-y-4 p-0">
                <div className="relative rounded-xl overflow-hidden bg-gray-100">
                  <div className="w-full h-20 sm:h-32 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center relative">
                    <div className="absolute -bottom-8 sm:-bottom-10 left-4 sm:left-6 z-10">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white overflow-hidden bg-gray-200 shadow">
                        {profile?.logo ? (
                          <img src={profile.logo} alt="Company Logo" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="px-4 sm:px-6 pt-8 sm:pt-10 pb-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-semibold leading-tight text-gray-900 w-full">
                          {profile?.companyName || 'Your Company'}
                        </h2>
                      </div>
                      {profile?.industry && (
                        <p className="text-base text-gray-800 font-medium">{profile.industry}</p>
                      )}
                      {profile?.location && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="h-4 w-4" /> {profile.location}
                        </p>
                      )}
                      {profile?.workforceSize && (
                        <p className="text-sm text-gray-700">{profile.workforceSize} employees</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Talent Hunt Navigation */}
            <Card>
              <CardHeader>
                <CardTitle>Talent Hunt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant={activeSection === 'home' ? 'default' : 'outline'} 
                  className="w-full justify-start h-12"
                  onClick={() => setActiveSection('home')}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>

                <Button 
                  variant={activeSection === 'jobs' ? 'default' : 'outline'} 
                  className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50"
                  onClick={() => setActiveSection('jobs')}
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  Job Listings
                </Button>

                <Button 
                  variant={activeSection === 'matches' ? 'default' : 'outline'} 
                  className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50"
                  onClick={() => setActiveSection('matches')}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Candidate Matches
                </Button>

                <Button 
                  variant={activeSection === 'shortlist' ? 'default' : 'outline'} 
                  className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50"
                  onClick={() => setActiveSection('shortlist')}
                >
                  <Star className="mr-2 h-4 w-4" />
                  Shortlisted
                </Button>

                <Button 
                  variant={activeSection === 'interviews' ? 'default' : 'outline'} 
                  className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50"
                  onClick={() => setActiveSection('interviews')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Interviews
                </Button>

                <Button 
                  variant={activeSection === 'settings' ? 'default' : 'outline'} 
                  className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50"
                  onClick={() => setActiveSection('settings')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>

                {/* Flow Steps - Under Dashboard */}
                <div className="border-t pt-3 mt-3">
                  <Button 
                    variant={activeSection === 'about' ? 'default' : 'outline'} 
                    className="w-full justify-start h-12"
                    onClick={() => setActiveSection('about')}
                  >
                    <Info className="mr-2 h-4 w-4" />
                    About
                  </Button>

                  <Button 
                    variant={activeSection === 'company' ? 'default' : 'outline'} 
                    className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50"
                    onClick={() => setActiveSection('company')}
                  >
                    <Building className="mr-2 h-4 w-4" />
                    Company Profile
                  </Button>

                  <Button 
                    variant={activeSection === 'create-job' ? 'default' : 'outline'} 
                    className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50"
                    onClick={() => setActiveSection('create-job')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Job
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {activeSection === 'about' && (
              <AboutSection onProceed={() => setActiveSection('company')} />
            )}

            {activeSection === 'company' && (
              <CompanyProfileSection onProceed={() => setActiveSection('create-job')} />
            )}

            {activeSection === 'create-job' && (
              <CreateJobSection onProceed={() => setActiveSection('home')} />
            )}

            {activeSection === 'home' && (
              <>
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                          <p className="text-2xl font-bold">{stats.totalJobs}</p>
                        </div>
                        <Briefcase className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                          <p className="text-2xl font-bold">{stats.activeJobs}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Matches</p>
                          <p className="text-2xl font-bold">{stats.totalMatches}</p>
                        </div>
                        <Search className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                          <p className="text-2xl font-bold">{stats.shortlistedCandidates}</p>
                        </div>
                        <Star className="h-8 w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        onClick={handleCreateJob}
                        className="h-16 text-lg"
                      >
                        <Briefcase className="mr-2 h-5 w-5" />
                        Create New Job
                      </Button>
                      <Button 
                        variant="outline"
                        className="h-16 text-lg"
                        onClick={() => setActiveSection('matches')}
                      >
                        <Search className="mr-2 h-5 w-5" />
                        View Matches
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Jobs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Talent Hunt Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {jobs.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">No talent hunt jobs created yet.</p>
                        <Button onClick={handleCreateJob}>Create Your First Job</Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {jobs.slice(0, 3).map((job) => (
                          <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h3 className="font-semibold">{job.position}</h3>
                              <p className="text-sm text-gray-600">{job.location || 'Remote'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={job.status === 'published' ? 'default' : 'secondary'}>
                                {job.status}
                              </Badge>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewMatches(job.id)}
                              >
                                View Matches
                              </Button>
                            </div>
                          </div>
                        ))}
                        {jobs.length > 3 && (
                          <div className="text-center pt-2">
                            <Button variant="outline" onClick={() => setActiveSection('jobs')}>
                              View All Jobs
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {activeSection === 'jobs' && (
              <JobsSection jobs={jobs} onCreateJob={handleCreateJob} onViewMatches={handleViewMatches} />
            )}

            {activeSection === 'matches' && (
              <MatchesSection jobs={jobs} onViewMatches={handleViewMatches} />
            )}

            {activeSection === 'shortlist' && (
              <ShortlistSection jobs={jobs} onViewShortlist={handleViewShortlist} />
            )}

            {activeSection === 'interviews' && (
              <InterviewsSection />
            )}

            

            {activeSection === 'settings' && (
              <SettingsSection />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Section Components
function JobsSection({ jobs, onCreateJob, onViewMatches }: { 
  jobs: any[], 
  onCreateJob: () => void, 
  onViewMatches: (jobId: string) => void 
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Talent Hunt Jobs</CardTitle>
          <Button onClick={onCreateJob}>Create New Job</Button>
        </div>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No talent hunt jobs created yet.</p>
            <Button onClick={onCreateJob}>Create Your First Job</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{job.position}</h3>
                    <p className="text-sm text-gray-600 mb-2">{job.location || 'Remote'}</p>
                    <p className="text-gray-800 text-sm line-clamp-2">{job.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <Badge variant={job.status === 'published' ? 'default' : 'secondary'}>
                        {job.status}
                      </Badge>
                      <span>{job.jobType || 'Full-time'}</span>
                      <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onViewMatches(job.id)}
                    >
                      View Matches
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MatchesSection({ jobs, onViewMatches }: { 
  jobs: any[], 
  onViewMatches: (jobId: string) => void 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidate Matches</CardTitle>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No jobs to view matches for.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{job.position}</h3>
                    <p className="text-sm text-gray-600">{job.location || 'Remote'}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onViewMatches(job.id)}
                  >
                    View Matches
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ShortlistSection({ jobs, onViewShortlist }: { 
  jobs: any[], 
  onViewShortlist: (jobId: string) => void 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shortlisted Candidates</CardTitle>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No jobs to view shortlists for.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{job.position}</h3>
                    <p className="text-sm text-gray-600">{job.location || 'Remote'}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onViewShortlist(job.id)}
                  >
                    View Shortlist
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InterviewsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Interviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Schedule and manage interviews for shortlisted candidates</p>
          <Button variant="outline">Manage Interviews</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AboutSection({ onProceed }: { onProceed?: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About Talent Hunt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-gray-800">
        <p>
          Finding top talents just got easier and better. As a recruiter, employer or HR personnel, you can now source quality career professionals who make great additions to your team through our private talent hunting system.
        </p>

        <div>
          <div className="font-semibold mb-1">Benefits</div>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Use simple tools to simplify complex recruitment procedures.</li>
            <li>Find and hire onsite, remote and hybrid career professionals.</li>
            <li>Attract great people to help grow your business.</li>
            <li>Manage multiple listings and applications with ease.</li>
            <li>Improve your recruitment and talent hiring results.</li>
            <li>Conclude your recruitment process in record time.</li>
            <li>Administer and review pre-interview assessment tests.</li>
            <li>Keep the hiring process information-open and available.</li>
            <li>Notify followers and non-followers of your company page.</li>
            <li>Private job listings with direct candidate matching.</li>
          </ul>
        </div>

        {onProceed && (
          <div className="pt-2">
            <Button onClick={onProceed}>
              Proceed
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CompanyProfileSection({ onProceed }: { onProceed?: () => void }) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  // Form
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [location, setLocation] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [workforceSize, setWorkforceSize] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [about, setAbout] = useState('')
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await recruiterService.getProfile()
      if ((res as any)?.success && (res as any).data?.profile) {
        const profileData = (res as any).data.profile
        setProfile(profileData)
        setCompanyName(profileData.companyName || '')
        setIndustry(profileData.industry || '')
        setLocation(profileData.location || '')
        setContactEmail(profileData.contactEmail || '')
        setContactPhone(profileData.contactPhone || '')
        setWebsite(profileData.website || '')
        setWorkforceSize(profileData.workforceSize || '')
        if (profileData.logoUrl) setLogoPreview(profileData.logoUrl)
        setAbout(profileData.about || '')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const form = new FormData()
      form.append('companyName', companyName)
      if (industry) form.append('industry', industry)
      if (location) form.append('location', location)
      if (contactEmail) form.append('contactEmail', contactEmail)
      if (contactPhone) form.append('contactPhone', contactPhone)
      if (website) form.append('website', website)
      if (workforceSize) form.append('workforceSize', workforceSize)
      if (logoFile) form.append('logo', logoFile)
      if (about) form.append('about', about)
      const res = await recruiterService.saveProfileForm(form)
      if ((res as any)?.success) {
        showSuccess('Company profile saved successfully')
        setShowEditModal(false)
        loadProfile() // Reload profile to show updated data
        if (onProceed) {
          onProceed()
        }
      }
    } catch (error) {
      showError('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-gray-500">Loading company profile...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Company Profile</CardTitle>
            <Button onClick={() => setShowEditModal(true)} variant="outline">
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {profile ? (
            <div className="space-y-6">
              {/* Company Display */}
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 rounded-lg border-2 border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50">
                  {profile.logoUrl ? (
                    <img src={profile.logoUrl} alt="Company Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">{profile.companyName}</h2>
                  {profile.industry && (
                    <p className="text-lg text-gray-700">{profile.industry}</p>
                  )}
                  {profile.location && (
                    <p className="text-gray-600 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </p>
                  )}
                  {profile.workforceSize && (
                    <p className="text-gray-600">{profile.workforceSize} employees</p>
                  )}
                </div>
              </div>

              {/* Company Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.website && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Website</h3>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {profile.website}
                    </a>
                  </div>
                )}
                {profile.contactEmail && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Contact Email</h3>
                    <p className="text-gray-600">{profile.contactEmail}</p>
                  </div>
                )}
                {profile.contactPhone && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Contact Phone</h3>
                    <p className="text-gray-600">{profile.contactPhone}</p>
                  </div>
                )}
              </div>

              {profile.about && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Company Description</h3>
                  <p className="text-gray-600 leading-relaxed">{profile.about}</p>
                </div>
              )}

              {onProceed && (
                <div className="pt-4">
                  <Button onClick={onProceed} className="w-full">
                    Continue to Job Creation
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No company profile found. Please create one to continue.</p>
              <Button onClick={() => setShowEditModal(true)}>
                Create Company Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Company Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Logo</label>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400">
                      <Building className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e)=>{ const f = e.target.files?.[0] || null; setLogoFile(f || null); if (f) { const url = URL.createObjectURL(f); setLogoPreview(url); } }}
                  className="text-sm"
                />
              </div>
              <div className="text-xs text-gray-500">Upload a square image for best results.</div>
            </div>

            {/* Company Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name *</label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Industry</label>
                <Input
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g., Technology, Healthcare"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State, Country"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <Input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://company.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Workforce Size</label>
                <Input
                  value={workforceSize}
                  onChange={(e) => setWorkforceSize(e.target.value)}
                  placeholder="e.g., 50-100 employees"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Email</label>
                <Input
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="hr@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Phone</label>
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Company Description</label>
              <Textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Tell us about your company..."
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CreateJobSection({ onProceed }: { onProceed?: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Talent Hunt Job</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Create a private job listing for talent hunting</p>
          <Button onClick={onProceed}>
            Create Job & Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Manage your talent hunt settings</p>
          <Button variant="outline">Open Settings</Button>
        </div>
      </CardContent>
    </Card>
  );
}
