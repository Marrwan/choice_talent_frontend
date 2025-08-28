'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { recruiterService } from '@/services/recruiterService';

export default function RecruitersLandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleProceed = async () => {
    try {
      setLoading(true);
      const res = await recruiterService.getProfile();
      // If profile exists go to company page; else go to profile form
      if (res?.success && res.data?.profile) {
        router.push('/recruiters/profile');
      } else {
        router.push('/recruiters/profile');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-8">
      <NavigationHeader title="Recruitment" />

      <Card>
        <CardHeader>
          <CardTitle>About Recruitment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-800">
          <p>
            Finding top talents just got easier and better. As a recruiter, employer or HR personnel, you can now source quality career professionals who make great additions to your team.
          </p>

          <div>
            <div className="font-semibold mb-1">Benefits</div>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Use simple tools to simplify complex recruitment procedures.</li>
              <li>Find and hire onsite, remote and hybrid career professionals.</li>
              <li>Attract great people to help grow your business.</li>
              <li>Manage multiple listings and applications with ease.</li>
              <li>Improve your recruitment and talent hiring results.</li>
              <li>Conclude your recruitment process in record time.</li>
              <li>Administer and review pre-interview assessment tests.</li>
              <li>Keep the hiring process information-open and available.</li>
              <li>Notify followers and non-followers of your company page.</li>
            </ul>
          </div>

          <div className="pt-2">
            <Button onClick={handleProceed} disabled={loading}>
              {loading ? 'Checking company page...' : 'Proceed'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


