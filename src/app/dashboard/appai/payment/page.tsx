'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/lib/useToast';
import { useAuth } from '@/lib/store';
import { Building2, Copy, AlertCircle, Mail, Upload } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useSearchParams } from 'next/navigation';

export default function AppAIPaymentPage() {
  const toast = useToast();
  const { user } = useAuth();
  const [paymentId, setPaymentId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const searchParams = useSearchParams();
  const subscriptionId = (searchParams ? searchParams.get('sid') : '') || '';

  useEffect(() => {
    const generatePaymentId = () => {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 8);
      return `APPAI-${timestamp}-${randomStr}`.toUpperCase();
    };
    setPaymentId(generatePaymentId());
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.showSuccess('Copied to clipboard!', 'Success');
    } catch {
      toast.showError('Failed to copy', 'Error');
    }
  };

  const handleSendPaymentEmail = async () => {
    try {
      const formData = new FormData();
      formData.append('paymentId', paymentId);
      if (subscriptionId) formData.append('subscriptionId', subscriptionId);
      if (file) formData.append('proofOfPayment', file);

      const res = await apiClient.post('/job-subscription/appai/payment-email', formData, true);
      if ((res as any).success !== false) {
        toast.showSuccess('Payment email sent to billing', 'Success');
      } else {
        toast.showError('Failed to send payment email', 'Error');
      }
    } catch (e) {
      console.error(e);
      toast.showError('Failed to send payment email', 'Error');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AppAI Payment</h1>
          <p className="text-gray-600 mt-2">Complete payment to activate AppAI (30 days).</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Service:</span>
              <span>AppAI (Automated Job Hunting & Application System)</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Duration:</span>
              <span>30 days</span>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-blue-900">Unique Payment ID:</span>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(paymentId)} className="text-blue-600 hover:text-blue-800">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="font-mono text-lg text-blue-900 bg-white p-2 rounded border">{paymentId}</div>
              <p className="text-sm text-blue-700 mt-2">Include this ID when emailing your payment proof.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center">
                  <Building2 className="mr-2 h-5 w-5" /> Bank Transfer
                </h3>
                <Badge variant="secondary">Recommended</Badge>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between"><span className="text-gray-600">Account Number:</span><span className="font-mono">0055583458</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Account Name:</span><span>Top Grade Project LTD</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Bank:</span><span>Access/Diamond Bank</span></div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">After payment:</p>
                    <p>Click "I HAVE MADE PAYMENT" to email billing@myjobhunting.com with your Payment ID.</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="max-w-xs" />
                <Button variant="outline" onClick={handleSendPaymentEmail}>
                  <Mail className="mr-2 h-4 w-4" /> I HAVE MADE PAYMENT
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


