'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { recruiterService } from '@/services/recruiterService';
import { useToast } from '@/lib/useToast';

export default function JobMatchesPage() {
  const router = useRouter();
  const params = useParams();
  const { showSuccess, showError } = useToast();
  const jobId = params?.jobId as string;
  
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [filterText, setFilterText] = useState('');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterJobType, setFilterJobType] = useState<string>('');
  const [filterMinExp, setFilterMinExp] = useState<string>('');
  const [filterCareerCats, setFilterCareerCats] = useState<string[]>([]);

  useEffect(() => {
    loadJobAndMatches();
  }, [jobId]);

  const loadJobAndMatches = async () => {
    try {
      setLoading(true);
      
      // Load job details
      const jobRes = await recruiterService.getJob(jobId);
      if (jobRes?.success) {
        setJob(jobRes.data.job);
        
        // Load matches based on job criteria
        const matchesRes = await recruiterService.search({
          position: jobRes.data.job.position,
          description: jobRes.data.job.description,
          location: jobRes.data.job.location,
          categories: jobRes.data.job.categoryOfPosition ? [jobRes.data.job.categoryOfPosition] : undefined,
          jobTypes: jobRes.data.job.jobType ? [jobRes.data.job.jobType] : undefined,
          careerCategories: jobRes.data.job.careerCategory || undefined,
          minExperience: jobRes.data.job.totalYearsExperience ? Number(jobRes.data.job.totalYearsExperience) : undefined
        });
        
        if (matchesRes?.success) {
          setResults(matchesRes.data.results || []);
        }
      }
    } catch (error) {
      console.error('Error loading job and matches:', error);
      showError('Failed to load job and matches');
    } finally {
      setLoading(false);
    }
  };

  const shortlist = async (userId: string) => {
    try {
      await recruiterService.shortlist(userId);
      showSuccess('Candidate shortlisted successfully');
    } catch (error) {
      showError('Failed to shortlist candidate');
    }
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
      <NavigationHeader title={`Matches for ${job.position}`} />
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">{job.position}</h1>
            <p className="text-gray-600">{job.location || 'Remote'} • {job.jobType || 'Full-time'}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBackToDashboard}>Back to Dashboard</Button>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-gray-700">{job.description}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matching Profiles</CardTitle>
          <CardDescription>Refine results and shortlist candidates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              <Input placeholder="Filter by text..." value={filterText} onChange={(e)=>setFilterText(e.target.value)} />
              <Input placeholder="Location" value={filterLocation} onChange={(e)=>setFilterLocation(e.target.value)} />
              <select className="w-full border rounded px-3 py-2 text-sm" value={filterJobType} onChange={(e)=>setFilterJobType(e.target.value)}>
                <option value="">Job Type (any)</option>
                <option>Remote Job</option>
                <option>Freelance Job</option>
                <option>Part time Job</option>
                <option>Full time job</option>
                <option>Contract Job</option>
                <option>Volunteer Job</option>
              </select>
              <Input placeholder="Minimum experience (years)" type="number" value={filterMinExp} onChange={(e)=>setFilterMinExp(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Career Category</label>
              <select className="w-full border rounded px-3 py-2 text-sm" value={filterCareerCats[0] || ''} onChange={(e)=>setFilterCareerCats(e.target.value ? [e.target.value] : [])}>
                <option value="">Career Category (any)</option>
                <option>Undergraduate Internship</option>
                <option>Graduate Trainee / Interns</option>
                <option>Entry-Level</option>
                <option>Intermediate Level</option>
                <option>Experienced Level</option>
                <option>Senior Level</option>
                <option>Supervisory Level</option>
                <option>Management Level</option>
                <option>Executive Level</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results
              .filter(r => !filterText || ((r.firstName && r.lastName ? `${r.firstName} ${r.lastName}` : r.user?.name) || '').toLowerCase().includes(filterText.toLowerCase()))
              .filter(r => !filterLocation || (r.stateOfResidence || r.jobHuntingSettings?.preferredLocations?.[0] || '').toLowerCase().includes(filterLocation.toLowerCase()))
              .map((r:any) => (
                <Card key={r.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{r.firstName && r.lastName ? `${r.firstName} ${r.lastName}` : r.user?.name || 'Professional'}</CardTitle>
                    <CardDescription>{r.persona || r.professionalSummary?.slice(0, 100) || ''}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm text-gray-600">Location: {r.stateOfResidence || r.jobHuntingSettings?.preferredLocations?.[0] || 'N/A'}</div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={()=>shortlist(r.userId || r.user?.id)}>Shortlist</Button>
                      <Button size="sm" variant="outline" onClick={()=>window.open(`/dashboard/professional-career-profile/view?id=${r.userId || r.user?.id}`, '_blank')}>View Profile</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            {results.length === 0 && <div className="text-gray-500">No results found.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
