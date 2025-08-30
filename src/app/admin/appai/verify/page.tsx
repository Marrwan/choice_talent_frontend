'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/lib/useToast';
import { CheckCircle, XCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface VerificationDetails {
  userId: string;
  userEmail: string;
  userName: string;
  subscriptionId: string;
  paymentId: string;
  currentStatus: 'pending' | 'verified' | 'rejected';
  subscriptionStatus: string;
  createdAt: string;
  verifiedAt?: string;
}

export default function AppAIVerificationPage() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [details, setDetails] = useState<VerificationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const subscriptionId = searchParams?.get('sid') || '';
  const paymentId = searchParams?.get('pid') || '';

  useEffect(() => {
    if (subscriptionId && paymentId) {
      setLoading(false);
    } else {
      setError('Missing subscription ID or payment ID');
      setLoading(false);
    }
  }, [subscriptionId, paymentId]);

  const loadVerificationDetails = async () => {
    try {
      const response = await apiClient.get(`/appai-verification/details?subscriptionId=${subscriptionId}&paymentId=${paymentId}`, false);
      
      if ((response as any).success) {
        setDetails((response as any).data);
      } else {
        setError('Failed to load verification details');
      }
    } catch (error) {
      console.error('Error loading verification details:', error);
      setError('Failed to load verification details');
    }
  };

  const handlePasswordSubmit = async () => {
    if (!adminPassword.trim()) {
      setPasswordError('Please enter the admin password');
      return;
    }

    try {
      setPasswordError(null);
      // Test the password by trying to load verification details
      const response = await apiClient.get(`/appai-verification/details?subscriptionId=${subscriptionId}&paymentId=${paymentId}&adminPassword=${encodeURIComponent(adminPassword)}`, false);
      
      if ((response as any).success) {
        setIsAuthenticated(true);
        setDetails((response as any).data);
      } else {
        setPasswordError('Invalid password or verification details not found');
      }
    } catch (error) {
      console.error('Error authenticating:', error);
      setPasswordError('Invalid password or verification details not found');
    }
  };

  const handleVerification = async (action: 'verify' | 'reject') => {
    try {
      setVerifying(true);
      const response = await apiClient.post('/appai-verification/verify', {
        subscriptionId,
        paymentId,
        action,
        adminPassword
      }, false);

      if ((response as any).success) {
        toast.showSuccess(
          `AppAI payment ${action === 'verify' ? 'verified' : 'rejected'} successfully`,
          'Success'
        );
        // Reload details to show updated status
        await loadVerificationDetails();
      } else {
        toast.showError(`Failed to ${action} payment`, 'Error');
      }
    } catch (error) {
      console.error(`Error ${action}ing payment:`, error);
      toast.showError(`Failed to ${action} payment`, 'Error');
    } finally {
      setVerifying(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading verification details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-red-800 mb-2">Verification Error</h2>
                <p className="text-red-600">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show password authentication form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <ShieldCheck className="h-8 w-8 text-blue-600 mr-3" />
                <CardTitle>AppAI Payment Verification</CardTitle>
              </div>
              <p className="text-gray-600">Enter the admin password to access verification details</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  id="adminPassword"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter admin password"
                />
                {passwordError && (
                  <p className="text-red-600 text-sm mt-1">{passwordError}</p>
                )}
              </div>
              <Button
                onClick={handlePasswordSubmit}
                className="w-full"
                disabled={!adminPassword.trim()}
              >
                Access Verification
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show verification details if authenticated and details are loaded
  if (!details) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading verification details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <ShieldCheck className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">AppAI Payment Verification</h1>
          </div>
          <p className="text-gray-600">Verify or reject AppAI subscription payment</p>
        </div>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {getStatusIcon(details.currentStatus)}
              <span className="ml-2">Payment Details</span>
              <span className="ml-auto">{getStatusBadge(details.currentStatus)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">User Name:</span>
                  <span className="font-semibold">{details.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">User Email:</span>
                  <span className="font-semibold">{details.userEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">User ID:</span>
                  <span className="font-mono text-sm">{details.userId}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Subscription ID:</span>
                  <span className="font-mono text-sm">{details.subscriptionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Payment ID:</span>
                  <span className="font-mono text-sm">{details.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Subscription Status:</span>
                  <Badge variant="outline">{details.subscriptionStatus}</Badge>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Created:</span> {new Date(details.createdAt).toLocaleString()}
                </div>
                {details.verifiedAt && (
                  <div>
                    <span className="font-medium">Verified:</span> {new Date(details.verifiedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {details.currentStatus === 'pending' && (
          <Card>
            <CardHeader>
              <CardTitle>Verification Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => handleVerification('verify')}
                  disabled={verifying}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {verifying ? 'Verifying...' : 'Verify Payment'}
                </Button>
                <Button
                  onClick={() => handleVerification('reject')}
                  disabled={verifying}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  {verifying ? 'Rejecting...' : 'Reject Payment'}
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                <strong>Verify:</strong> Activates the user's AppAI subscription for 30 days.<br />
                <strong>Reject:</strong> Keeps the subscription pending and notifies the user.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Status Message */}
        {details.currentStatus !== 'pending' && (
          <Card className={details.currentStatus === 'verified' ? 'border-green-200' : 'border-red-200'}>
            <CardContent className="pt-6">
              <div className="text-center">
                {details.currentStatus === 'verified' ? (
                  <>
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Payment Verified</h3>
                    <p className="text-green-600">This payment has been verified and the user's AppAI subscription is now active.</p>
                  </>
                ) : (
                  <>
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Payment Rejected</h3>
                    <p className="text-red-600">This payment has been rejected and the user's subscription remains pending.</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
