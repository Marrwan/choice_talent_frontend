"use client"

import { useEffect, useState } from 'react'
import { recruiterService } from '@/services/recruiterService'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function InterviewsPage() {
  const [items, setItems] = useState<any[]>([])
  const [form, setForm] = useState<any>({ candidateUserId: '', type: 'virtual', position: '', address: '', meetingLink: '', contactPerson: '', contactPhone: '', notes: '', scheduledAt: '' })

  const load = async () => {
    const res = await recruiterService.listInterviews()
    if (res.success) setItems(res.data.items || [])
  }
  useEffect(() => { load() }, [])

  const create = async () => {
    await recruiterService.createInterview(form)
    setForm({ candidateUserId: '', type: 'virtual', position: '', address: '', meetingLink: '', contactPerson: '', contactPhone: '', notes: '', scheduledAt: '' })
    load()
  }

  return (
    <div className="container mx-auto px-4 py-8 grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <Link href="/recruiters/dashboard">
          <Button variant="outline">Back to Recruiter Dashboard</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Schedule Interview</CardTitle>
          <CardDescription>Create virtual or physical interview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input placeholder="Candidate User ID" value={form.candidateUserId} onChange={(e) => setForm({ ...form, candidateUserId: e.target.value })} />
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="virtual">Virtual</SelectItem>
              <SelectItem value="physical">Physical</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
          {form.type === 'physical' ? (
            <Input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          ) : (
            <Input placeholder="Meeting Link" value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} />
          )}
          <Input placeholder="Contact Person" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
          <Input placeholder="Contact Phone" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
          <Input placeholder="Date & Time (ISO)" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
          <Input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button onClick={create}>Create</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Invites</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className="border p-2 rounded">
              <div className="font-medium">{it.type.toUpperCase()} - {it.position || 'N/A'}</div>
              <div className="text-sm text-gray-600">Scheduled: {new Date(it.scheduled_at || it.scheduledAt).toLocaleString()}</div>
              <div className="text-sm">Candidate: {it.candidateUserId}</div>
              <div className="text-sm">Status: {it.candidateResponse}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}


