"use client"

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '@/lib/store'

export default function RecruiterDashboardPage() {
  const { user } = useAuth()
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Recruiter Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recruiter Profile</CardTitle>
            <CardDescription>Manage your company information</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/recruiters/profile" className="text-blue-600 underline">Open</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manage Applications</CardTitle>
            <CardDescription>Search and shortlist professionals</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/recruiters/applications" className="text-blue-600 underline">Open</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Shortlisted</CardTitle>
            <CardDescription>View your shortlisted candidates</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/recruiters/shortlist" className="text-blue-600 underline">Open</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Assessments</CardTitle>
            <CardDescription>Create and review assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/recruiters/assessments" className="text-blue-600 underline">Open</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Interviews</CardTitle>
            <CardDescription>Schedule virtual or physical interviews</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/recruiters/interviews" className="text-blue-600 underline">Open</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>InMail</CardTitle>
            <CardDescription>Message professionals directly</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/recruiters/inmail" className="text-blue-600 underline">Open</Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


