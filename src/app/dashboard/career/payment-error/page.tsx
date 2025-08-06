'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function PaymentErrorPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/career/resume-payment" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Payment
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Online Payment Temporarily Unavailable</h1>
          <p className="text-gray-600 mt-2">We're working on integrating online payment options. Please use bank transfer instead.</p>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertCircle className="mr-2 h-5 w-5" />
              Payment Integration in Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <p className="text-red-800 mb-3">
                We're currently finalizing our integration with Flutterwave and Paystack payment gateways. 
                Online payment options will be available soon.
              </p>
              
              <div className="space-y-2 text-sm text-red-700">
                <p><strong>What's happening:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Payment gateway applications are being processed</li>
                  <li>Security and compliance checks are in progress</li>
                  <li>Integration testing is ongoing</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Recommended Alternative</h3>
              <p className="text-blue-800 mb-3">
                Please use our secure bank transfer option to complete your payment:
              </p>
              
              <div className="bg-white p-3 rounded border border-blue-200 mb-3">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Number:</span>
                    <span className="font-mono font-medium">0055583458</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Name:</span>
                    <span className="font-medium">Top Grade Project LTD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank:</span>
                    <span className="font-medium">Access/Diamond Bank</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Link href="/dashboard/career/resume-payment">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Payment
                  </Button>
                </Link>
                <Button className="w-full">
                  <Building2 className="mr-2 h-4 w-4" />
                  Use Bank Transfer
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">What to Expect</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Online payment will be available within the next few weeks</p>
                <p>• You'll receive an email notification when it's ready</p>
                <p>• All payment methods will be secure and PCI compliant</p>
                <p>• Multiple payment options including cards and digital wallets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-3">
              If you have any questions about payment options or need assistance, 
              our support team is here to help.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="font-medium">Email:</span>
                <span className="ml-2 text-blue-600">support@jobprofile.com.ng</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Response time:</span>
                <span className="ml-2">Within 24 hours</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 