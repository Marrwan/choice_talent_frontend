"use client"

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { jobService } from '@/services/jobService'
import { applicationService } from '@/services/applicationService'
import { NavigationHeader } from '@/components/ui/navigation-header'
import { useToast } from '@/lib/useToast'

export default function ManageApplicationsPage() {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const [jobs, setJobs] = useState<any[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const [applications, setApplications] = useState<any[]>([])
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [loadingApps, setLoadingApps] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string>('')

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
    loadJobs() 
  }, [])
  
  useEffect(() => { 
    if (selectedJobId) loadApplications(selectedJobId) 
  }, [selectedJobId])

  const selectedJob = jobs.find(j => j.id === selectedJobId)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <NavigationHeader title="Manage Applications" />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Applications</h1>
        <p className="text-gray-600 mt-2">Review and manage applications for your job listings</p>
      </div>

      {/* Job Listings Section */}
      <Card className="mb-6 shadow-lg">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="text-xl">Your Job Listings</CardTitle>
          <CardDescription>Select a job to view its applications</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {loadingJobs ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">Loading jobs...</div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">No job listings yet.</div>
              <Link href="/recruiters/jobs/new">
                <Button>Create Your First Job</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job) => (
                <Card 
                  key={job.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedJobId === job.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedJobId(job.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{job.position}</h3>
                      <Badge variant={job.status === 'published' ? 'default' : 'secondary'}>
                        {job.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{job.location || 'Remote'}</span>
                      <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applications Section */}
      {selectedJob && (
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Applications for "{selectedJob.position}"</CardTitle>
                <CardDescription>
                  {applications.length} application{applications.length !== 1 ? 's' : ''} received
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-sm">
                {selectedJob.status}
              </Badge>
            </div>
            </CardHeader>
          <CardContent className="p-6">
            {loadingApps ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-500">Loading applications...</div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-500 mb-4">
                  Applications will appear here once candidates apply to your job posting.
                </p>
                <Link href="/jobs">
                  <Button variant="outline">View Public Job Listings</Button>
                </Link>
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}


