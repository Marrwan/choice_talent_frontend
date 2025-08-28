"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { recruiterService, RecruiterProfile } from '@/services/recruiterService';

export default function RecruiterCompanyProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);

  // Form
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [workforceSize, setWorkforceSize] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [about, setAbout] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await recruiterService.getProfile();
        if (res?.success && res.data?.profile) {
          setProfile(res.data.profile as any);
          const p: any = res.data.profile;
          setCompanyName(p.companyName || '');
          setIndustry(p.industry || '');
          setLocation(p.location || '');
          setContactEmail(p.contactEmail || '');
          setContactPhone(p.contactPhone || '');
          setWebsite(p.website || '');
          setWorkforceSize(p.workforceSize || '');
          if (p.logoUrl) setLogoPreview(p.logoUrl);
          setAbout(p.about || '');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const form = new FormData();
      form.append('companyName', companyName);
      if (industry) form.append('industry', industry);
      if (location) form.append('location', location);
      if (contactEmail) form.append('contactEmail', contactEmail);
      if (contactPhone) form.append('contactPhone', contactPhone);
      if (website) form.append('website', website);
      if (workforceSize) form.append('workforceSize', workforceSize);
      if (logoFile) form.append('logo', logoFile);
      if (about) form.append('about', about);
      const res = await recruiterService.saveProfileForm(form);
      if (res?.success) {
        router.push('/recruiters/jobs/new');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 pb-8">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pb-8">
      <NavigationHeader title="Company Page" />
      <Card>
        <CardHeader>
          <CardTitle>Company / Organization Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {logoPreview && (
            <div>
              <img src={logoPreview} alt="Company logo" className="h-20 w-20 object-cover rounded border" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e)=>{ const f = e.target.files?.[0] || null; setLogoFile(f || null); if (f) { const url = URL.createObjectURL(f); setLogoPreview(url); } }}
            />
            <div className="text-xs text-gray-500 mt-1">Upload a square image for best results.</div>
          </div>
          <Input placeholder="Company/Organization name" value={companyName} onChange={(e)=>setCompanyName(e.target.value)} />
          <Input placeholder="Industry" value={industry} onChange={(e)=>setIndustry(e.target.value)} />
          <Input placeholder="Workforce size" value={workforceSize} onChange={(e)=>setWorkforceSize(e.target.value)} />
          <Input placeholder="Location" value={location} onChange={(e)=>setLocation(e.target.value)} />
          <Input placeholder="Contact email" value={contactEmail} onChange={(e)=>setContactEmail(e.target.value)} />
          <Input placeholder="Contact number" value={contactPhone} onChange={(e)=>setContactPhone(e.target.value)} />
          <Input placeholder="Website" value={website} onChange={(e)=>setWebsite(e.target.value)} />
          <Textarea placeholder="Company Description" value={about} onChange={(e)=>setAbout(e.target.value)} className="min-h-[120px]" />
          <div className="pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Proceed to Job Details'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

