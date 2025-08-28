'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { jobService } from '@/services/jobService';
import { applicationService } from '@/services/applicationService';
import { useRouter } from 'next/navigation';

export default function JobsPublicPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [remote, setRemote] = useState(false);
  const router = useRouter();

  const load = async () => {
    const res = await jobService.listPublic({ q, location, remote });
    if (res.success) setJobs(res.data.jobs || []);
  };

  useEffect(() => { load(); }, []);

  const apply = async (jobId: string) => {
    try {
      const res = await applicationService.apply(jobId);
      if (res.success) alert('Application submitted! The recruiter will see this in Manage Applications.');
    } catch { alert('Please login to apply.'); router.push('/login'); }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex gap-2 mb-4">
        <Input placeholder="Search position" value={q} onChange={(e)=>setQ(e.target.value)} />
        <Input placeholder="Location" value={location} onChange={(e)=>setLocation(e.target.value)} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={remote} onChange={(e)=>setRemote(e.target.checked)} />
          Remote
        </label>
        <Button onClick={load}>Search</Button>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <CardTitle>{job.position}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                {job.isRemote ? 'Remote' : (job.location || 'Location not specified')}
              </div>
              <Button onClick={() => apply(job.id)}>Apply</Button>
            </CardContent>
          </Card>
        ))}
        {jobs.length === 0 && (
          <div className="text-gray-500">No jobs yet.</div>
        )}
      </div>
    </div>
  );
}


