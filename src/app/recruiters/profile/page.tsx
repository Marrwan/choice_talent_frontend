"use client"

import { useEffect, useState } from 'react'
import { recruiterService, type RecruiterProfile } from '@/services/recruiterService'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/lib/useToast'
import Link from 'next/link'

export default function RecruiterProfilePage() {
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<RecruiterProfile>({ companyName: '', industry: '', location: '', contactEmail: '', contactPhone: '', logoUrl: '' })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await recruiterService.getProfile()
        if (res.success && res.data.profile) setProfile({
          companyName: res.data.profile.companyName || '',
          industry: res.data.profile.industry || '',
          location: res.data.profile.location || '',
          contactEmail: res.data.profile.contactEmail || '',
          contactPhone: res.data.profile.contactPhone || '',
          logoUrl: res.data.profile.logoUrl || ''
        })
        if (res.data.profile?.logoUrl) setLogoPreview(res.data.profile.logoUrl)
      } finally {
        setLoading(false)
      }
  useEffect(() => {
    if (logoFile) {
      const objectUrl = URL.createObjectURL(logoFile)
      setLogoPreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
  }, [logoFile])
    }
    load()
  }, [])

  const onSave = async () => {
    setSaving(true)
    try {
      const form = new FormData()
      form.append('companyName', profile.companyName)
      if (profile.industry) form.append('industry', profile.industry)
      if (profile.location) form.append('location', profile.location)
      if (profile.contactEmail) form.append('contactEmail', profile.contactEmail)
      if (profile.contactPhone) form.append('contactPhone', profile.contactPhone)
      if (logoFile) form.append('logo', logoFile)
      const res = await recruiterService.saveProfileForm(form)
      if (res.success) {
        showSuccess('Recruiter profile updated', 'Saved')
      }
    } catch (e: any) {
      showError(e?.message || 'Failed to save profile', 'Error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-4">
        <Link href="/recruiters/dashboard">
          <Button variant="outline">Back to Recruiter Dashboard</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recruiter Profile</CardTitle>
          <CardDescription>Tell candidates about your company</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Company/Organization Name</Label>
            <Input value={profile.companyName} onChange={(e) => setProfile({ ...profile, companyName: e.target.value })} placeholder="Company name" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Industry</Label>
              <Input value={profile.industry || ''} onChange={(e) => setProfile({ ...profile, industry: e.target.value })} placeholder="e.g. Technology" />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={profile.location || ''} onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder="City, Country" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Contact Email</Label>
              <Input type="email" value={profile.contactEmail || ''} onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })} placeholder="email@company.com" />
            </div>
            <div>
              <Label>Contact Phone</Label>
              <Input value={profile.contactPhone || ''} onChange={(e) => setProfile({ ...profile, contactPhone: e.target.value })} placeholder="+1 234 567 890" />
            </div>
          </div>
          <div>
            <Label>Company Logo (optional)</Label>
            <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
            {logoPreview && (
              <div className="mt-3">
                <img src={logoPreview} alt="Logo preview" className="h-20 w-20 object-cover rounded border" />
              </div>
            )}
          </div>
          <div className="pt-2">
            <Button onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


