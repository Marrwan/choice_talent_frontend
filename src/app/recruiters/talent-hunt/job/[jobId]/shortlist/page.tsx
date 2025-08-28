'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { recruiterService } from '@/services/recruiterService';
import { useToast } from '@/lib/useToast';

export default function JobShortlistPage() {
  const router = useRouter();
  const params = useParams();
  const { showSuccess, showError } = useToast();
  const jobId = params?.jobId as string;
  
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [shortlisted, setShortlisted] = useState<any[]>([]);

  useEffect(() => {
    loadJobAndShortlist();
  }, [jobId]);

  const loadJobAndShortlist = async () => {
    try {
      setLoading(true);
      
      // Load job details
      const jobRes = await recruiterService.getJob(jobId);
      if (jobRes?.success) {
        setJob(jobRes.data.job);
      }
      
      // Load shortlisted candidates
      const shortlistRes = await recruiterService.listShortlist();
      if (shortlistRes?.success) {
        setShortlisted(shortlistRes.data.items || []);
      }
    } catch (error) {
      console.error('Error loading job and shortlist:', error);
      showError('Failed to load job and shortlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromShortlist = async (candidateId: string) => {
    try {
      await recruiterService.removeShortlist(candidateId);
      showSuccess('Candidate removed from shortlist');
      loadJobAndShortlist(); // Reload the list
    } catch (error) {
      showError('Failed to remove candidate from shortlist');
    }
  };

  const handleBackToMatches = () => {
    router.push(`/recruiters/talent-hunt/job/${jobId}/matches`);
  };

  const handleBackToDashboard = () => {
    router.push('/recruiters/talent-hunt/dashboard');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">Job not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <NavigationHeader title={`Shortlist for ${job.position}`} />
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">{job.position}</h1>
            <p className="text-gray-600">{job.location || 'Remote'} • {job.jobType || 'Full-time'}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBackToMatches}>Back to Matches</Button>
            <Button variant="outline" onClick={handleBackToDashboard}>Back to Dashboard</Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shortlisted Candidates</CardTitle>
          <CardDescription>Manage your shortlisted candidates for this position</CardDescription>
        </CardHeader>
        <CardContent>
          {shortlisted.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No candidates shortlisted yet.</p>
              <Button onClick={handleBackToMatches}>View Matches</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shortlisted.map((candidate: any) => (
                <Card key={candidate.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{candidate.candidate?.name || 'Candidate'}</CardTitle>
                    <CardDescription>
                      {candidate.notes || 'No notes added'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm text-gray-600">
                      Shortlisted: {new Date(candidate.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => removeFromShortlist(candidate.candidate?.id)}
                      >
                        Remove
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => window.open(`/dashboard/professional-career-profile/view?id=${candidate.candidate?.id}`, '_blank')}
                      >
                        View Profile
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => window.open(`/recruiters/interviews?candidateId=${candidate.candidate?.id}`, '_self')}
                      >
                        Schedule Interview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
