'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/lib/useToast';
import { useAuth } from '@/lib/store';
import { 
  Download, 
  CreditCard, 
  Building2, 
  Copy, 
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Mail
} from 'lucide-react';
import Link from 'next/link';

export default function ResumePaymentPage() {
  const toast = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [paymentId, setPaymentId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Generate unique payment ID
    const generatePaymentId = () => {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 8);
      return `RESUME-${timestamp}-${randomStr}`.toUpperCase();
    };
    setPaymentId(generatePaymentId());
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.showSuccess('Copied to clipboard!', 'Success');
    } catch (error) {
      toast.showError('Failed to copy to clipboard', 'Error');
    }
  };

  const handleBankTransfer = () => {
    // This would typically open a modal or navigate to bank transfer details
    toast.showInfo('Please use the bank transfer details below', 'Info');
  };

  const handleOnlinePayment = () => {
    // Redirect to error page for online payment
    router.push('/dashboard/career/payment-error');
  };

  const handlePaymentProof = () => {
    // This would typically open a file upload modal
    toast.showInfo('Please send proof of payment to support@jobprofile.com.ng', 'Info');
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p>Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/career" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Career Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Resume Download Payment</h1>
          <p className="text-gray-600 mt-2">Complete your payment to download your professional resume</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="mr-2 h-5 w-5" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Service:</span>
                  <span>Professional Resume Download</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Price:</span>
                  <span className="text-2xl font-bold text-green-600">₦3,000</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Duration:</span>
                  <span>12 months access</span>
                </div>
                
                {/* Payment ID */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-blue-900">Payment ID:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(paymentId)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="font-mono text-lg text-blue-900 bg-white p-2 rounded border">
                    {paymentId}
                  </div>
                  <p className="text-sm text-blue-700 mt-2">
                    Keep this ID for reference. Include it when sending proof of payment.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>What You'll Get</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>ATS-optimized templates</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Professional PDF download</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Expert content guidance</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Unlimited revisions</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>12-month access</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Payment Options */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Bank Transfer */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center">
                      <Building2 className="mr-2 h-5 w-5" />
                      Bank Transfer
                    </h3>
                    <Badge variant="secondary">Recommended</Badge>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Number:</span>
                      <span className="font-mono">0055583458</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Name:</span>
                      <span>Top Grade Project LTD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bank:</span>
                      <span>Access/Diamond Bank</span>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">After payment:</p>
                        <p>Send your proof of payment and payment ID to:</p>
                        <p className="font-mono text-blue-600">support@jobprofile.com.ng</p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleBankTransfer}
                    className="w-full"
                    variant="outline"
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Use Bank Transfer
                  </Button>
                </div>

                {/* Online Payment */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Online Payment
                    </h3>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 text-center p-2 border rounded">
                        <div className="text-sm font-medium">Flutterwave</div>
                      </div>
                      <div className="flex-1 text-center p-2 border rounded">
                        <div className="text-sm font-medium">Paystack</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                      <div className="text-sm text-red-800">
                        <p className="font-medium">Temporarily Unavailable</p>
                        <p>Please use bank transfer instead. Online payment will be available soon.</p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleOnlinePayment}
                    className="w-full"
                    variant="outline"
                    disabled
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Online (Coming Soon)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                    <span>Copy the Payment ID above</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                    <span>Transfer ₦3,000 to the provided bank account</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                    <span>Take a screenshot or photo of your payment receipt</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
                    <span>Email the proof of payment and Payment ID to support@jobprofile.com.ng</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">5</span>
                    <span>You'll receive an email confirmation within 24 hours</span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="mr-2 h-5 w-5" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  If you have any questions about payment or need assistance, contact our support team:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm">support@jobprofile.com.ng</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">Response time: Within 24 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 