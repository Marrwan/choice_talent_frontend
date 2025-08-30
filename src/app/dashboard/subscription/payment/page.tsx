'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/lib/useToast';
import { useAuth } from '@/lib/store';
import { Building2, Copy, Upload, Mail, Crown } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useSearchParams } from 'next/navigation';

export default function SubscriptionPaymentPage() {
  const toast = useToast();
  const { user } = useAuth();
  const [paymentId, setPaymentId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const searchParams = useSearchParams();
  const subscriptionId = (searchParams ? searchParams.get('sid') : '') || '';
  const price = 3300;

  useEffect(() => {
    const generatePaymentId = () => {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 8);
      return `SUB-${timestamp}-${randomStr}`.toUpperCase();
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
      if (!file) {
        toast.showError('Please attach a payment screenshot', 'Error');
        return;
      }

      const formData = new FormData();
      formData.append('paymentId', paymentId);
      if (subscriptionId) formData.append('subscriptionId', subscriptionId);
      if (file) formData.append('proofOfPayment', file);
      formData.append('userEmail', user?.email || '');
      formData.append('userName', user?.name || '');

      const res = await apiClient.post('/subscription-verification/payment-email', formData, true);
      if ((res as any).success !== false) {
        toast.showSuccess('Payment email sent to billing@choicetalents.com.ng', 'Success');
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
          <h1 className="text-3xl font-bold text-gray-900">Premium Subscription Payment</h1>
          <p className="text-gray-600 mt-2">Complete payment to upgrade to Premium subscription.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Service:</span>
              <span className="flex items-center">
                <Crown className="h-5 w-5 text-yellow-600 mr-2" />
                Premium Subscription
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Duration:</span>
              <span>30 days</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Price:</span>
              <span className="font-semibold text-green-700 text-lg">&#8358;{price.toLocaleString()}</span>
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
                <div className="flex justify-between"><span className="text-gray-600">Account Name:</span><span>Choice Talents LTD</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Account Number:</span><span className="font-mono">0876 039 732</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Bank:</span><span>Guaranty Trust Bank (GTB)</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Amount:</span><span className="font-semibold text-green-700">&#8358;{price.toLocaleString()}</span></div>
              </div>
              <div className="space-y-4">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    const fileInput = document.getElementById('subscription-payment-screenshot') as HTMLInputElement;
                    if (fileInput) {
                      fileInput.click();
                    }
                  }}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Attach Payment Screenshot</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG or PDF (Max 5MB)</p>
                    </div>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0] || null;
                        console.log('File selected:', selectedFile);
                        setFile(selectedFile);
                      }}
                      className="hidden"
                      id="subscription-payment-screenshot"
                      aria-label="Attach payment screenshot"
                    />
                    <label htmlFor="subscription-payment-screenshot" className="cursor-pointer">
                      <Button 
                        variant="outline" 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          const fileInput = document.getElementById('subscription-payment-screenshot') as HTMLInputElement;
                          if (fileInput) {
                            fileInput.click();
                          }
                        }}
                      >
                        Choose File
                      </Button>
                    </label>
                  </div>
                </div>
                
                {file && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Upload className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">{file.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFile(null)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={handleSendPaymentEmail}
                  disabled={!file}
                  className="w-full"
                >
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
