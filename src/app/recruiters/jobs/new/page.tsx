'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { jobService } from '@/services/jobService';
import { useToast } from '@/lib/useToast';

export default function NewJobPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [position, setPosition] = useState('');
  const [location, setLocation] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [jobType, setJobType] = useState('');
  const [careerCategory, setCareerCategory] = useState('');
  const [categoryOfPosition, setCategoryOfPosition] = useState('');
  const [totalYearsExperience, setTotalYearsExperience] = useState('');
  const [workLocation, setWorkLocation] = useState('');

  const handlePublish = async () => {
    if (!position.trim() || !description.trim()) return;
    setSaving(true);
    try {
      const res = await jobService.create({ position: position.trim(), location: isRemote ? undefined : location.trim() || undefined, isRemote, description: description.trim(), status: 'published', jobType: jobType || undefined, careerCategory: careerCategory || undefined, categoryOfPosition: categoryOfPosition || undefined, totalYearsExperience: totalYearsExperience ? Number(totalYearsExperience) : undefined, workLocation: workLocation || undefined });
      if (res.success) {
        showSuccess('Job published successfully', 'Your listing is now live.');
        setTimeout(() => router.push('/recruiters/dashboard'), 600);
      } else {
        showError(res.message || 'Failed to publish job', 'Error');
      }
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-8">
      <NavigationHeader title="Create Job" />
      <Card>
        <CardHeader>
          <CardTitle>Job details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Position" value={position} onChange={(e)=>setPosition(e.target.value)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isRemote} onChange={(e)=>setIsRemote(e.target.checked)} />
            Remote position
          </label>
          {!isRemote && (
            <Input placeholder="Job location (address)" value={location} onChange={(e)=>setLocation(e.target.value)} />
          )}
          <Textarea placeholder="Job description" className="min-h-[160px]" value={description} onChange={(e)=>setDescription(e.target.value)} />
          <Input placeholder="Job Type" value={jobType} onChange={(e)=>setJobType(e.target.value)} />
          <Input placeholder="Career Category" value={careerCategory} onChange={(e)=>setCareerCategory(e.target.value)} />
          <Input placeholder="Category of Position" value={categoryOfPosition} onChange={(e)=>setCategoryOfPosition(e.target.value)} />
          <Input placeholder="Total Years of Work Experience" type="number" value={totalYearsExperience} onChange={(e)=>setTotalYearsExperience(e.target.value)} />
          <Input placeholder="Work Location" value={workLocation} onChange={(e)=>setWorkLocation(e.target.value)} />
          <div className="pt-2">
            <Button onClick={handlePublish} disabled={saving || !position || !description}>{saving ? 'Publishing...' : 'Publish'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


