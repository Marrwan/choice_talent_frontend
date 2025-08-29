"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { NavigationHeader } from '@/components/ui/navigation-header'
import { useAuth } from '@/lib/store'
import { recruiterService } from '@/services/recruiterService'
import { jobService } from '@/services/jobService'
import { applicationService } from '@/services/applicationService'
import { useToast } from '@/lib/useToast'
import { 
  Home, 
  Briefcase, 
  Users, 
  FileText, 
  Calendar, 
  MessageSquare,
  Settings,
  User,
  MapPin,
  Building,
  Star,
  TrendingUp,
  Info,
  Plus
} from 'lucide-react'

export default function RecruiterDashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState<string>('about')
  const [flowStep, setFlowStep] = useState<'about' | 'company' | 'job' | 'dashboard'>('about')
  const [profile, setProfile] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    shortlistedCandidates: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load recruiter profile
      const profileRes = await recruiterService.getProfile()
      if ((profileRes as any)?.success) {
        const profileData = (profileRes as any).data?.profile
        setProfile(profileData)
      }

      // Load jobs
      const jobsRes = await jobService.listMine()
      if ((jobsRes as any)?.success) {
        const jobsList = (jobsRes as any).data?.jobs || []
        setJobs(jobsList)
        setStats({
          totalJobs: jobsList.length,
          activeJobs: jobsList.filter((j: any) => j.status === 'published').length,
          totalApplications: 0, // Will be calculated from applications
          shortlistedCandidates: 0 // Will be calculated from applications
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleCreateJob = () => {
    setActiveSection('create-job')
  }
  const [dashboardSelectedJobId, setDashboardSelectedJobId] = useState<string>("")

  const handleTalentHunt = () => {
    router.push('/recruiters/talent-hunt')
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <NavigationHeader title="Recruitment" />
        
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Company Profile & Navigation */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Company Profile Card */}
            <Card>
              <CardContent className="space-y-4 p-0">
                <div className="relative rounded-xl overflow-hidden bg-gray-100">
                  <div className="w-full h-20 sm:h-32 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center relative">
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

            {/* Recruitment Navigation */}
        <Card>
          <CardHeader>
                <CardTitle>Recruitment</CardTitle>
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
                  variant={activeSection === 'applications' ? 'default' : 'outline'} 
                  className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50"
                  onClick={() => setActiveSection('applications')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage Applications
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
                  variant={activeSection === 'assessments' ? 'default' : 'outline'} 
                  className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50"
                  onClick={() => setActiveSection('assessments')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Assessments
                </Button>

                <Button 
                  variant={activeSection === 'inmail' ? 'default' : 'outline'} 
                  className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50"
                  onClick={() => setActiveSection('inmail')}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  InMail
                </Button>

                <Button 
                  variant={activeSection === 'meetings' ? 'default' : 'outline'} 
                  className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50"
                  onClick={() => setActiveSection('meetings')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Meetings
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
                            <Briefcase className="h-8 w-8 text-blue-600" />
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
                              <p className="text-sm font-medium text-gray-600">Applications</p>
                              <p className="text-2xl font-bold">{stats.totalApplications}</p>
                            </div>
                            <Users className="h-8 w-8 text-purple-600" />
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
                            Create Job Posting
                          </Button>
                          <Button 
                            onClick={handleTalentHunt}
                            variant="outline"
                            className="h-16 text-lg"
                          >
                            <Users className="mr-2 h-5 w-5" />
                            Start Talent Hunt
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Jobs */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Job Listings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {jobs.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-600 mb-4">No job listings yet.</p>
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
                                  <Link href="/recruiters/applications">
                                    <Button size="sm" variant="outline">View Applications</Button>
                                  </Link>
                                </div>
                              </div>
                            ))}
                            {jobs.length > 3 && (
                              <div className="text-center pt-2">
                                <Link href="/recruiters/applications">
                                  <Button variant="outline">View All Jobs</Button>
                                </Link>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}

            {activeSection === 'jobs' && (
              <JobsSection 
                jobs={jobs} 
                onCreateJob={handleCreateJob} 
                onViewApplications={(jobId: string) => { setDashboardSelectedJobId(jobId); setActiveSection('applications') }} 
              />
            )}

            {activeSection === 'applications' && (
              <ApplicationsSection initialSelectedJobId={dashboardSelectedJobId} />
            )}

            {activeSection === 'shortlist' && (
              <ShortlistSection />
            )}

            {activeSection === 'interviews' && (
              <InterviewsSection />
            )}

            {activeSection === 'assessments' && (
              <AssessmentsSection />
            )}

            {activeSection === 'inmail' && (
              <InMailSection />
            )}

            {activeSection === 'meetings' && (
              <MeetingsSection />
            )}

            {activeSection === 'about' && (
              <AboutSection onProceed={() => setActiveSection('company')} />
            )}

            {activeSection === 'company' && (
              <CompanyProfileSection onProceed={() => setActiveSection('create-job')} />
            )}

            {activeSection === 'create-job' && (
              <CreateJobSection onProceed={() => setActiveSection('home')} />
            )}

            {activeSection === 'settings' && (
              <SettingsSection />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Section Components
function JobsSection({ jobs, onCreateJob, onViewApplications }: { jobs: any[], onCreateJob: () => void, onViewApplications: (jobId: string) => void }) {
  return (
        <Card>
          <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Job Listings</CardTitle>
          <Button onClick={onCreateJob}>Create New Job</Button>
        </div>
          </CardHeader>
          <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No job listings yet.</p>
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
                    <Button size="sm" variant="outline" onClick={() => onViewApplications(job.id)}>View Applications</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
          </CardContent>
        </Card>
  )
}

function ApplicationsSection({ initialSelectedJobId }: { initialSelectedJobId?: string }) {
  const [jobs, setJobs] = useState<any[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const [applications, setApplications] = useState<any[]>([])
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [loadingApps, setLoadingApps] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string>('')
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    loadJobs()
  }, [])

  useEffect(() => {
    if (initialSelectedJobId) {
      setSelectedJobId(initialSelectedJobId)
    }
  }, [initialSelectedJobId])

  const loadJobs = async () => {
    setLoadingJobs(true)
    try {
      const res = await jobService.listMine()
      if ((res as any).success) {
        const list = (res as any).data.jobs || []
        setJobs(list)
        if (list.length > 0 && !selectedJobId) {
          setSelectedJobId(list[0].id)
        }
      }
    } catch (error) {
      showError('Failed to load jobs')
    } finally { 
      setLoadingJobs(false) 
    }
  }

  const loadApplications = async (jobId: string) => {
    if (!jobId) { 
      setApplications([])
      return 
    }
    setLoadingApps(true)
    try {
      const res = await applicationService.listByJob(jobId)
      if ((res as any).success) {
        setApplications((res as any).data.applications || [])
      }
    } catch (error) {
      showError('Failed to load applications')
    } finally { 
      setLoadingApps(false) 
    }
  }

  const handleStatusUpdate = async (applicationId: string, status: string) => {
    setUpdatingStatus(applicationId)
    try {
      const res = await applicationService.updateStatus(applicationId, status as any)
      if ((res as any).success) {
        showSuccess(`Application ${status}`)
        loadApplications(selectedJobId)
      }
    } catch (error) {
      showError('Failed to update application status')
    } finally {
      setUpdatingStatus('')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      submitted: { color: 'bg-blue-100 text-blue-800', label: 'Submitted' },
      shortlisted: { color: 'bg-yellow-100 text-yellow-800', label: 'Shortlisted' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      interview_scheduled: { color: 'bg-green-100 text-green-800', label: 'Interview Scheduled' },
      hired: { color: 'bg-purple-100 text-purple-800', label: 'Hired' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted
    return <Badge className={config.color}>{config.label}</Badge>
  }

  useEffect(() => { 
    if (selectedJobId) loadApplications(selectedJobId) 
  }, [selectedJobId])

  const selectedJob = jobs.find(j => j.id === selectedJobId)

  return (
        <Card>
          <CardHeader>
        <CardTitle>Applications</CardTitle>
          </CardHeader>
          <CardContent>
        {/* Job Listings Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Select Job</h3>
          {loadingJobs ? (
            <div className="text-center py-4">
              <div className="text-gray-500">Loading jobs...</div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">No job listings yet.</p>
              <Link href="/recruiters/jobs/new">
                <Button>Create Your First Job</Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {jobs.map((job) => (
                <Button 
                  key={job.id} 
                  size="sm" 
                  variant={selectedJobId === job.id ? 'default' : 'outline'} 
                  onClick={() => setSelectedJobId(job.id)}
                >
                  {job.position}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Applications Section */}
        {selectedJob && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Applications for "{selectedJob.position}"</h3>
              <Badge variant="outline" className="text-sm">
                {applications.length} application{applications.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            {loadingApps ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Loading applications...</div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-500 mb-4">
                  Applications will appear here once candidates apply to your job posting.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <Card key={app.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={app.applicant?.profilePicture} />
                          <AvatarFallback>
                            {app.applicant?.name?.charAt(0) || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {app.applicant?.name || 'Applicant'}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Applied {new Date(app.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(app.status)}
                            </div>
                          </div>
                          
                          {app.coverNote && (
                            <p className="text-sm text-gray-700 mb-3 bg-gray-50 p-3 rounded">
                              "{app.coverNote}"
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/dashboard/professional-career-profile/view?id=${app.applicant?.id}`}>
                              <Button size="sm" variant="outline">
                                View Profile
                              </Button>
                            </Link>
                            
                            {app.status === 'submitted' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleStatusUpdate(app.id, 'shortlisted')}
                                  disabled={updatingStatus === app.id}
                                >
                                  {updatingStatus === app.id ? 'Updating...' : 'Shortlist'}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(app.id, 'rejected')}
                                  disabled={updatingStatus === app.id}
                                >
                                  {updatingStatus === app.id ? 'Updating...' : 'Reject'}
                                </Button>
                              </>
                            )}
                            
                            {app.status === 'shortlisted' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleStatusUpdate(app.id, 'interview_scheduled')}
                                disabled={updatingStatus === app.id}
                              >
                                {updatingStatus === app.id ? 'Updating...' : 'Schedule Interview'}
                              </Button>
                            )}
                            
                            <Link href={`/recruiters/interviews?candidateId=${app.applicant?.id}&position=${encodeURIComponent(selectedJob.position)}`}>
                              <Button size="sm" variant="outline">
                                Schedule Interview
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
          </CardContent>
        </Card>
  )
}

function ShortlistSection() {
  return (
        <Card>
          <CardHeader>
        <CardTitle>Shortlisted Candidates</CardTitle>
          </CardHeader>
          <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">View your shortlisted candidates</p>
          <Link href="/recruiters/shortlist">
            <Button>View Shortlist</Button>
          </Link>
        </div>
          </CardContent>
        </Card>
  )
}

function InterviewsSection() {
  return (
        <Card>
          <CardHeader>
            <CardTitle>Interviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Schedule and manage interviews</p>
          <Link href="/recruiters/interviews">
            <Button>Manage Interviews</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function AssessmentsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessments</CardTitle>
          </CardHeader>
          <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Create and review assessments</p>
          <Link href="/recruiters/assessments">
            <Button>Manage Assessments</Button>
          </Link>
        </div>
          </CardContent>
        </Card>
  )
}

function InMailSection() {
  return (
        <Card>
          <CardHeader>
            <CardTitle>InMail</CardTitle>
          </CardHeader>
          <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Message professionals directly</p>
          <Link href="/recruiters/inmail">
            <Button>Send InMail</Button>
          </Link>
        </div>
          </CardContent>
        </Card>
  )
}

function MeetingsSection() {
  return (
        <Card>
          <CardHeader>
            <CardTitle>Meetings</CardTitle>
          </CardHeader>
          <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Schedule and manage video meetings</p>
          <Link href="/recruiters/meetings">
            <Button>Manage Meetings</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function AboutSection({ onProceed }: { onProceed?: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About Recruitment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-gray-800">
        <p>
          Finding top talents just got easier and better. As a recruiter, employer or HR personnel, you can now source quality career professionals who make great additions to your team.
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
  )
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
  )
}

function CreateJobSection({ onProceed }: { onProceed?: () => void }) {
  const { showSuccess, showError } = useToast()
  const [position, setPosition] = useState('')
  const [location, setLocation] = useState('')
  const [isRemote, setIsRemote] = useState(false)
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [jobType, setJobType] = useState<string>('')
  const [careerCategory, setCareerCategory] = useState<string>('')
  const [categoryOfPosition, setCategoryOfPosition] = useState<string>('')
  const [totalYearsExperience, setTotalYearsExperience] = useState('')
  const [workCity, setWorkCity] = useState('')
  const [workCountry, setWorkCountry] = useState('')

  const handlePublish = async () => {
    if (!position.trim() || !description.trim()) return
    setSaving(true)
    try {
      const composedWorkLocation = [workCity.trim(), workCountry.trim()].filter(Boolean).join(', ')
      const res = await jobService.create({
        position: position.trim(),
        location: isRemote ? undefined : (location.trim() || undefined),
        isRemote,
        description: description.trim(),
        status: 'published',
        jobType: jobType || undefined,
        careerCategory: careerCategory || undefined,
        categoryOfPosition: categoryOfPosition || undefined,
        totalYearsExperience: totalYearsExperience ? Number(totalYearsExperience) : undefined,
        workLocation: composedWorkLocation || undefined
      })
      if ((res as any).success) {
        showSuccess('Job published successfully', 'Your listing is now live.')
        if (onProceed) {
          onProceed()
        } else {
          // Refresh the dashboard data
          window.location.reload()
        }
      } else {
        showError((res as any).message || 'Failed to publish job', 'Error')
      }
    } finally { setSaving(false) }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Job</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Job Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
          <Input placeholder="Position" value={position} onChange={(e)=>setPosition(e.target.value)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isRemote} onChange={(e)=>setIsRemote(e.target.checked)} />
            Remote position
          </label>
          {!isRemote && (
            <Input placeholder="Job location (address)" value={location} onChange={(e)=>setLocation(e.target.value)} />
          )}
          <Textarea placeholder="Job description" className="min-h-[160px]" value={description} onChange={(e)=>setDescription(e.target.value)} />
        </div>
        
        {/* Job Classification */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Job Classification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Job Type</label>
              <select className="w-full border rounded px-3 py-2 text-sm" value={jobType} onChange={(e)=>setJobType(e.target.value)}>
                <option value="">Select job type</option>
                <option>Remote Job</option>
                <option>Freelance Job</option>
                <option>Part time Job</option>
                <option>Full time job</option>
                <option>Contract Job</option>
                <option>Volunteer Job</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Career Category</label>
              <select className="w-full border rounded px-3 py-2 text-sm" value={careerCategory} onChange={(e)=>setCareerCategory(e.target.value)}>
                <option value="">Select career category</option>
                <option>Undergraduate Internship</option>
                <option>Graduate Trainee / Interns</option>
                <option>Entry-Level</option>
                <option>Intermediate Level</option>
                <option>Experienced Level</option>
                <option>Senior Level</option>
                <option>Supervisory Level</option>
                <option>Management Level</option>
                <option>Executive Level</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Additional Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Additional Details</h3>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Category of Position</label>
            <select className="w-full border rounded px-3 py-2 text-sm" value={categoryOfPosition} onChange={(e)=>setCategoryOfPosition(e.target.value)}>
              <option value="">Select category of position</option>
              <option>Accounting / Auditing / Bookkeeping / Budgetting / Finance / Lending / Tax</option>
              <option>Administration / Secretarial / Personal Assistant (PA) / Clerical / Office Assistant</option>
              <option>Advertising / Branding / Public Relation (PR)</option>
              <option>Agriculture / Agro-Allied / Farming</option>
              <option>Architectural / Interior and Exterior Designing / Surveying</option>
              <option>Artisan / Labour / Factory Work / Craftsmen / Vocational / Semi-Skilled</option>
              <option>Arts / Craft / Art Creatives</option>
              <option>Automobile Services / Auto Painting / Auto Mechanic / Auto Electrician / Auto Panel Beater / Auto Upholstery</option>
              <option>Aviation / Airline Services / Air Hostess / Pilot / Captain / Aircraft Engineer</option>
              <option>Beauty / Beauty Care / Make-up / Hair Stylist / Pedicure / Manicure / Masseuse</option>
              <option>Biological Sciences - Biochemistry / Microbiology / Plant Science / Environmental</option>
              <option>Caregiver / Nanny / Domestic Help</option>
              <option>Cashiers / Tellers / Ticketing</option>
              <option>Chaplain / Pastoral / Reverend / Ministration</option>
              <option>Coaching / Mentoring / Change Management / Development / Training / Learning / Public Speaking</option>
              <option>Computer / Cloud Computing / Data Warehousing / Amazon Web Services (AWS)</option>
              <option>Computer / Database Support / Database Admin / Database Development / Oracle / MySQL</option>
              <option>Computer / Frontend Design / UI / UX / Frontend Scripting / JavaScript / React / JQuery</option>
              <option>Computer / Full Stack Software Development / Frontend & Backend / Web Design & Development</option>
              <option>Computer / Graphics Design / Artist</option>
              <option>Computer / Mobile App Development / Android / IOS / Games / React Native / Flutter</option>
              <option>Computer / Network & Hardware Engineering Support / Network Design and Security</option>
              <option>Computer / System Admin / Software Support / Windows Admin / Linux Admin</option>
              <option>Computer / Software Development / Software Testing / SaaS Development / Cloud Management / Analytics Development</option>
              <option>Computer Networking / Telecommunications / Mast Operations / Cybersecurity / Data Recovery / Home Networking</option>
              <option>Consulting / Business Strategy / Planning</option>
              <option>Cook / Chef / Baker / Pastry Chef / Steward</option>
              <option>Customer Service / Call Centre / Front Desk / Receptionist</option>
              <option>Data Entry / Data Reporting / Analysis / Business Analysis</option>
              <option>Design Creatives / 3D Design / Ad Design / Animation / Graphics / Prints / Visuals / Packaging</option>
              <option>Digital Marketing / Social Media Management</option>
              <option>Driving / Haulage / Dispatch Rider / Bike Rider / Chauffeur</option>
              <option>Economics / Statistics / Data Science</option>
              <option>Education - Higher Institution / Teaching / Lecturing / Training</option>
              <option>Education - Non-Academic / Registrar / Bursary / Admin / Librarian</option>
              <option>Education - Sec/Pri/Creche / Teaching / Tutoring / Creche Services</option>
              <option>Election Personnel / Ad-hoc Officers</option>
              <option>Engineering - Biomedical Engineering</option>
              <option>Engineering - Chemical / Petroleum / Petrochemical</option>
              <option>Engineering - Civil / Construction / Building</option>
              <option>Engineering - Electrical / Electronics / Telecom</option>
              <option>Engineering - Mechanical / Metallurgical / Mechatronics</option>
              <option>Environmental Services</option>
              <option>Executive / Top Management</option>
              <option>Facility Management / Estate Management / Maintenance / Real Estate</option>
              <option>Fashion Design / Beauty Care / Make-up / Tailoring / Hair Stylist / Bead Making / Shoe Making</option>
              <option>Food & Nutrition / Dietetics / Food Technology</option>
              <option>Furniture Design / Carpentry</option>
              <option>Graduate Trainee / Fresh Graduate / Graduate Internship</option>
              <option>Horticulture / Beautification / Gardening</option>
              <option>Hospitality / Travel & Tourism / Hotel / Restaurant / Catering / Museum / Club / Bar / Tour Guide</option>
              <option>House Keeping / Cleaning / Deep Cleaning / Drycleaning / Fumigation / Janitorial / Laundry</option>
              <option>HSE / Safety & Risk Management / Compliance</option>
              <option>Human Resources / Recruitment</option>
              <option>Insurance / Assurance / Actuary</option>
              <option>Internship / SIWES / Industrial Training</option>
              <option>Language Translation / Transcribing / Interpreting</option>
              <option>Law / Legal / Litigation</option>
              <option>Logistics / Procurement / Purchasing / Supply Chain</option>
              <option>Maritime Services / Shipping / Clearing & Forwarding / Marine Officer / Seamen</option>
              <option>Marketing / Sales / Business Development / Merchandiser</option>
              <option>Media / Broadcasting / Journalism / Content Writing / Editing / Blogging</option>
              <option>Medical - Anatomy / Physiology / Pathology / Basic Medical Science</option>
              <option>Medical - Dental / ENT</option>
              <option>Medical - Health Information / Medical Records / Health Management</option>
              <option>Medical - Nursing & Midwifery</option>
              <option>Medical - Optometrist / Ophthalmologist</option>
              <option>Medical - Pharmaceutical</option>
              <option>Medical - Physician / Medical Officer / Doctor / Consultants / Medical Internship</option>
              <option>Medical - Physiotherapy / Massage Therapy / Masseuse / Masseur</option>
              <option>Medical - Public Health Worker / Hospital Attendant / Orderly</option>
              <option>Medical - Veterinary Medicine</option>
              <option>Medical Laboratory / Radiography / Sonography</option>
              <option>Modelling / Ushering Services / Runway Services</option>
              <option>Monitoring and Evaluation / Social Worker</option>
              <option>Multimedia / Animation / Film Production / Photography / Cinematography / Video & Audio Editing</option>
              <option>Music Entertainment / Comedy / Disc Jockey (DJ) / Master of Ceremony (MC) / Events / Sound Engineering</option>
              <option>Operations / Project Management</option>
              <option>Physical Sciences - Chemistry / Physics / Geography / Earth Science (Geology) / Material Science / Astronomy</option>
              <option>Political Consulting / Policitical Advisory / Special Assistant</option>
              <option>Psychology / Clinical Psychology</option>
              <option>Quality Assurance (QA) / Quality Control (QC)</option>
              <option>Remote / Freelance / Work at home</option>
              <option>Research / Survey</option>
              <option>Scholarship / Grant / Competition</option>
              <option>Security - Guard / Gateman</option>
              <option>Security - Military / Police / Civil Defense / Para-Military</option>
              <option>Security - Professional / Public / Corporate Security Management</option>
              <option>Sports / Fitness / Fitness Coach / Gym Instructor / Nutritionist / Weightloss</option>
              <option>Store-Keeping & Warehousing</option>
              <option>Technician - Electrical / Electrician</option>
              <option>Technician - Fitter / Plumber / Welder / Panel Beater / Scaffolder</option>
              <option>Technician - Mechanical / Mechanic / Generator Technician</option>
              <option>Tender / Bid / Quotation / Proposal / Expression of Interest</option>
              <option>Waiter / Waitress / Concierge / Room Attendant</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Total Years of Work Experience" type="number" value={totalYearsExperience} onChange={(e)=>setTotalYearsExperience(e.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input placeholder="Work Location - City" value={workCity} onChange={(e)=>setWorkCity(e.target.value)} />
              <Input placeholder="Work Location - Country" value={workCountry} onChange={(e)=>setWorkCountry(e.target.value)} />
            </div>
      </div>
    </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end pt-6 border-t">
          <Button onClick={handlePublish} disabled={saving || !position || !description} className="px-8">
            {saving ? 'Publishing...' : onProceed ? 'Publish & Continue' : 'Publish Job'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SettingsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Manage your recruitment settings</p>
          <Link href="/recruiters/settings">
            <Button>Open Settings</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}


