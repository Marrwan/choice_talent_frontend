'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { recruiterService } from '@/services/recruiterService';
import { useToast } from '@/lib/useToast';

export default function TalentHuntDashboardPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      
      // Check if the method exists
      if (typeof recruiterService.listJobs !== 'function') {
        console.error('listJobs is not a function:', recruiterService.listJobs);
        showError('Service method not available');
        return;
      }
      
      // For now, we'll use the existing job service to get jobs
      // In the future, we should filter by talent hunt mode
      const res = await recruiterService.listJobs();
      if (res?.success) {
        setJobs(res.data?.jobs || []);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      showError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = () => {
    router.push('/recruiters/talent-hunt');
  };

  const handleViewMatches = (jobId: string) => {
    router.push(`/recruiters/talent-hunt/job/${jobId}/matches`);
  };



  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <NavigationHeader title="Talent Hunt Dashboard" />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Talent Hunt Jobs</h1>
          <p className="text-gray-600">Manage your private job listings and view candidate matches</p>
        </div>
        <Button onClick={handleCreateJob}>Create New Job</Button>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">No talent hunt jobs created yet.</p>
            <Button onClick={handleCreateJob}>Create Your First Job</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <CardTitle className="text-lg">{job.position}</CardTitle>
                <CardDescription>
                  {job.location || 'Remote'} • {job.jobType || 'Full-time'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {job.description?.substring(0, 100)}...
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleViewMatches(job.id)}
                    className="w-full"
                  >
                    View Matches
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
