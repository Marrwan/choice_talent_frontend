'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/lib/useToast';
import jobSubscriptionService, { JobActivityLog } from '@/services/jobSubscriptionService';
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertTriangle, Building2, Calendar } from 'lucide-react';

export default function ActivityLogPage() {
  const router = useRouter();
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState<JobActivityLog[]>([]);

  useEffect(() => {
    loadActivityLogs();
  }, []);

  const loadActivityLogs = async () => {
    try {
      setLoading(true);
      const logs = await jobSubscriptionService.getActivityLogs();
      setActivityLogs(logs);
    } catch (error) {
      console.error('Error loading activity logs:', error);
      showError('Failed to load activity logs', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.push('/dashboard/career')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Profile Forwarding Activity</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Track where and when your profile was forwarded, and the status of each activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : activityLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No activity logs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {activityLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-2 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-500" />
                        {log.companyName || 'N/A'}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {log.forwardedAt ? new Date(log.forwardedAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <Badge variant={log.status === 'completed' ? 'default' : 'secondary'}>
                            {log.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 