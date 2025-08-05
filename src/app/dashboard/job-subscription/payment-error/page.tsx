'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';

export default function PaymentErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const provider = searchParams.get('provider');

  const getProviderName = () => {
    switch (provider) {
      case 'flutterwave':
        return 'Flutterwave';
      case 'paystack':
        return 'Paystack';
      default:
        return 'Online Payment';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold">Online Payment Temporarily Unavailable</h1>
          <p className="text-muted-foreground">
            {getProviderName()} integration is currently being finalized
          </p>
        </div>

        {/* Error Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Service Unavailable
            </CardTitle>
            <CardDescription>
              We're working to provide you with secure online payment options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Online payment is temporarily unavailable.</strong> Kindly use bank transfer while we finalize integration with Flutterwave and Paystack.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h3 className="font-semibold">What you can do:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Use bank transfer to complete your payment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Upload proof of payment after transfer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>We'll notify you when online payment is available</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Bank Transfer Details:</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Account Number:</strong> 0055583458</div>
                <div><strong>Account Name:</strong> Top Grade Project LTD</div>
                <div><strong>Bank:</strong> Access/Diamond Bank</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button
            onClick={() => router.push('/dashboard/job-subscription')}
          >
            View Subscriptions
          </Button>
        </div>

        {/* Support Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Contact our support team for assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Email us at{' '}
              <a 
                href="mailto:support@jobprofile.com.ng" 
                className="text-primary hover:underline"
              >
                support@jobprofile.com.ng
              </a>
              {' '}for any questions about payment or subscription.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 