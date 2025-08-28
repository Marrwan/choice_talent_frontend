"use client"

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { jobService } from '@/services/jobService'
import { applicationService } from '@/services/applicationService'

export default function ManageApplicationsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const [applications, setApplications] = useState<any[]>([])
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [loadingApps, setLoadingApps] = useState(false)

  const loadJobs = async () => {
    setLoadingJobs(true)
    try {
      const res = await jobService.listMine()
      if (res.success) {
        const list = res.data.jobs || []
        setJobs(list)
        if (list.length > 0) setSelectedJobId(list[0].id)
      }
    } finally { setLoadingJobs(false) }
  }

  const loadApplications = async (jobId: string) => {
    if (!jobId) { setApplications([]); return }
    setLoadingApps(true)
    try {
      const res = await applicationService.listByJob(jobId)
      if (res.success) setApplications(res.data.applications || [])
    } finally { setLoadingApps(false) }
  }

  useEffect(() => { loadJobs() }, [])
  useEffect(() => { if (selectedJobId) loadApplications(selectedJobId) }, [selectedJobId])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/recruiters/dashboard">
          <Button variant="outline">Back to Recruiter Dashboard</Button>
        </Link>
      </div>
      <h1 className="text-2xl font-semibold mb-4">Manage Applications</h1>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Your Listings</CardTitle>
          <CardDescription>Select a job to view applications</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingJobs ? (
            <div>Loading jobs...</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {jobs.map((job) => (
                <Button key={job.id} size="sm" variant={selectedJobId === job.id ? 'default' : 'outline'} onClick={()=>setSelectedJobId(job.id)}>
                  {job.position}
                </Button>
              ))}
              {jobs.length === 0 && <div className="text-gray-500 text-sm">No listings yet.</div>}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>{jobs.find(j=>j.id===selectedJobId)?.position || ''}</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingApps ? (
            <div>Loading applications...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applications.map((app) => (
                <Card key={app.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{app.applicant?.name || 'Applicant'}</CardTitle>
                    <CardDescription>Status: {app.status}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex gap-2">
                      <Button size="sm" onClick={()=>applicationService.updateStatus(app.id, 'shortlisted').then(()=>loadApplications(selectedJobId))}>Shortlist</Button>
                      <Button size="sm" variant="outline" onClick={()=>applicationService.updateStatus(app.id, 'rejected').then(()=>loadApplications(selectedJobId))}>Reject</Button>
                      <Link href={`/recruiters/interviews?candidateId=${app.applicant?.id}&position=${encodeURIComponent(jobs.find(j=>j.id===selectedJobId)?.position||'')}`}>
                        <Button size="sm" variant="outline">Schedule Interview</Button>
                      </Link>
                    </div>
                    <Link href={`/dashboard/professional-career-profile/view?id=${app.applicant?.id}`} className="text-blue-600 text-sm underline">View Profile</Link>
                  </CardContent>
                </Card>
              ))}
              {applications.length === 0 && <div className="text-gray-500 text-sm">No applications yet.</div>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


