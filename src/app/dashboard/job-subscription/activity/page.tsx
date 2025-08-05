'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/lib/useToast';
import jobSubscriptionService, { JobActivityLog } from '@/services/jobSubscriptionService';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export default function ActivityLogPage() {
  const router = useRouter();
  const { toast } = useToast();
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
      toast({
        title: 'Error',
        description: 'Failed to load activity logs',
        variant: 'destructive'
      });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'profile_forwarded':
        return 'Profile Forwarded';
      case 'profile_screened':
        return 'Profile Screened';
      case 'feedback_received':
        return 'Feedback Received';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Activity Log</h1>
            <p className="text-muted-foreground">
              Track where your profile has been forwarded and company activities
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/job-subscription')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Subscriptions
          </Button>
        </div>

        {/* Activity Logs */}
        {activityLogs.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Activity Yet</CardTitle>
              <CardDescription>
                Your activity log will appear here once your profile is forwarded to companies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No activity has been recorded yet. This will update as your profile is forwarded to potential employers.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activityLogs.map((log) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <Badge variant={getStatusColor(log.status)}>
                          {log.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {getActivityTypeLabel(log.activityType)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDate(log.createdAt)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {log.companyName && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{log.companyName}</span>
                    </div>
                  )}
                  
                  {log.companyLocation && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{log.companyLocation}</span>
                    </div>
                  )}
                  
                  {log.position && (
                    <div>
                      <span className="text-sm font-medium">Position:</span>
                      <span className="text-sm ml-2">{log.position}</span>
                    </div>
                  )}
                  
                  {log.description && (
                    <div>
                      <span className="text-sm font-medium">Details:</span>
                      <p className="text-sm mt-1 text-muted-foreground">{log.description}</p>
                    </div>
                  )}
                  
                  {log.subscription && (
                    <div className="pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        Subscription: {log.subscription.subscriptionType.replace('_', ' ').replace('-', ' ')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {activityLogs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {activityLogs.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Activities</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {activityLogs.filter(log => log.status === 'completed').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {activityLogs.filter(log => log.status === 'in_progress').length}
                  </div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">
                    {activityLogs.filter(log => log.status === 'pending').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/job-subscription')}
          >
            Back to Subscriptions
          </Button>
          <Button
            onClick={() => router.push('/dashboard/career')}
          >
            Career Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
} 