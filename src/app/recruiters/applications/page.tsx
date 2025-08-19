"use client"

import { useEffect, useState } from 'react'
import { recruiterService } from '@/services/recruiterService'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ManageApplicationsPage() {
  const [position, setPosition] = useState('')
  const [location, setLocation] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const search = async () => {
    setLoading(true)
    try {
      const res = await recruiterService.search({ position, location })
      if (res.success) setResults(res.data.results || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { search() }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/recruiters/dashboard">
          <Button variant="outline">Back to Recruiter Dashboard</Button>
        </Link>
      </div>
      <h1 className="text-2xl font-semibold mb-4">Manage Applications</h1>
      <Card className="mb-4">
        <CardContent className="py-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input placeholder="Position/Designation" value={position} onChange={(e) => setPosition(e.target.value)} />
          <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <Button onClick={search} disabled={loading}>{loading ? 'Searching...' : 'Search'}</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <CardTitle>{r.fullName || r.user?.name || 'Professional'}</CardTitle>
              <CardDescription>{r.persona || r.professionalSummary?.slice(0, 80)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-gray-600">Location: {r.stateOfResidence || r.jobHuntingSettings?.preferredLocations?.[0] || 'N/A'}</div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => recruiterService.shortlist(r.userId || r.user?.id)}>Shortlist</Button>
                <Button size="sm" variant="outline" onClick={() => window.open(`/dashboard/professional-career-profile/view?id=${r.userId || r.user?.id}`, '_blank')}>View Profile</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


