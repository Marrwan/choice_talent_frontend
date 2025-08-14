'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/lib/useToast';
import { ArrowLeft, AlertTriangle, Send } from 'lucide-react';
import Link from 'next/link';

export default function ReportAbusePage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    abuseType: '',
    description: '',
    reportedUser: '',
    evidence: '',
    contactEmail: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.abuseType || !formData.description) {
      toast.showError('Please fill in all required fields', 'Validation Error');
      return;
    }

    try {
      setLoading(true);
      
      // TODO: Implement actual API call to submit abuse report
      // For now, just show success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.showSuccess('Abuse report submitted successfully. We will review it within 24 hours.', 'Report Submitted');
      router.push('/dashboard/career');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.showError('Failed to submit report. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/career"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Career Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Report Abuse</h1>
          <p className="text-gray-600 mt-2">
            Help us maintain a safe and professional environment by reporting any abuse or inappropriate behavior.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Report Abuse or Inappropriate Behavior
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="abuseType">Type of Abuse *</Label>
                <Select 
                  value={formData.abuseType} 
                  onValueChange={(value) => handleInputChange('abuseType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type of abuse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="spam">Spam or Unsolicited Messages</SelectItem>
                    <SelectItem value="fake_profile">Fake Profile</SelectItem>
                    <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                    <SelectItem value="scam">Scam or Fraud</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description of the Issue *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Please provide a detailed description of what happened..."
                  rows={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="reportedUser">Username/Email of Reported User (if applicable)</Label>
                <Input
                  id="reportedUser"
                  value={formData.reportedUser}
                  onChange={(e) => handleInputChange('reportedUser', e.target.value)}
                  placeholder="Enter username or email"
                />
              </div>

              <div>
                <Label htmlFor="evidence">Evidence or Additional Information</Label>
                <Textarea
                  id="evidence"
                  value={formData.evidence}
                  onChange={(e) => handleInputChange('evidence', e.target.value)}
                  placeholder="Screenshots, links, or additional context..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">Contact Email (for follow-up)</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="Your email address"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Important Information:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>All reports are reviewed within 24 hours</li>
                      <li>We take abuse reports seriously and investigate thoroughly</li>
                      <li>Your identity will be kept confidential</li>
                      <li>False reports may result in account suspension</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Link href="/dashboard/career">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading} className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  {loading ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
