"use client"

import { useEffect, useState } from 'react'
import { recruiterService } from '@/services/recruiterService'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ShortlistPage() {
  const [items, setItems] = useState<any[]>([])

  const load = async () => {
    const res = await recruiterService.listShortlist()
    if (res.success) setItems(res.data.items || [])
  }
  useEffect(() => { load() }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/recruiters/dashboard">
          <Button variant="outline">Back to Recruiter Dashboard</Button>
        </Link>
      </div>
      <h1 className="text-2xl font-semibold mb-4">Shortlisted Candidates</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) => (
          <Card key={it.id}>
            <CardHeader>
              <CardTitle>{it.candidate?.name || it.candidateUserId}</CardTitle>
              <CardDescription>{it.notes || 'No notes'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => window.open(`/dashboard/professional-career-profile/view?id=${it.candidate?.id || it.candidateUserId}`, '_blank')}>View Profile</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


