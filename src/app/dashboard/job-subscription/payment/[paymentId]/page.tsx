'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/lib/useToast';
import jobSubscriptionService, { JobPayment } from '@/services/jobSubscriptionService';
import { 
  Copy, 
  CheckCircle, 
  XCircle, 
  CreditCard, 
  Building2, 
  Mail,
  Download,
  Upload
} from 'lucide-react';

export default function PaymentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<JobPayment | null>(null);
  const [copied, setCopied] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);

  const paymentId = params.paymentId as string;

  useEffect(() => {
    if (paymentId) {
      loadPaymentDetails();
    }
  }, [paymentId]);

  const loadPaymentDetails = async () => {
    try {
      setLoading(true);
      // For now, we'll simulate the payment data since we need to get it from the subscription creation
      // In a real implementation, you'd fetch this from the API
      const mockPayment: JobPayment = {
        id: 'mock-id',
        subscriptionId: 'mock-subscription-id',
        paymentId: paymentId,
        amount: 5000,
        paymentMethod: 'bank_transfer',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setPayment(mockPayment);
    } catch (error) {
      console.error('Error loading payment details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Payment ID copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProofFile(file);
    }
  };

  const handleUploadProof = async () => {
    if (!proofFile || !payment) return;

    try {
      await jobSubscriptionService.uploadProofOfPayment(payment.paymentId, proofFile);
      toast({
        title: 'Success',
        description: 'Proof of payment uploaded successfully',
      });
      // Reload payment details to show updated status
      loadPaymentDetails();
    } catch (error) {
      console.error('Error uploading proof:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload proof of payment',
        variant: 'destructive'
      });
    }
  };

  const handleOnlinePayment = (provider: 'flutterwave' | 'paystack') => {
    // Redirect to error page as specified in requirements
    router.push(`/dashboard/job-subscription/payment-error?provider=${provider}`);
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

  if (!payment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Payment Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>The payment details could not be found.</p>
            <Button 
              className="mt-4"
              onClick={() => router.push('/dashboard/job-subscription')}
            >
              Back to Subscriptions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Payment Details</h1>
          <p className="text-muted-foreground">
            Complete your payment to activate your job subscription
          </p>
        </div>

        {/* Payment ID */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Payment ID
            </CardTitle>
            <CardDescription>
              Please save this Payment ID for your records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <code className="text-sm font-mono flex-1">
                {payment.paymentId}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(payment.paymentId)}
                className="flex items-center gap-2"
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Amount */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              ₦{payment.amount.toLocaleString()}
            </div>
            <p className="text-muted-foreground mt-2">
              Amount to be paid for your job subscription
            </p>
          </CardContent>
        </Card>

        {/* Bank Transfer Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bank Transfer Details
            </CardTitle>
            <CardDescription>
              Transfer the payment amount to the following account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Account Number</Label>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg mt-1">
                  <code className="text-lg font-mono flex-1">0055583458</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard('0055583458')}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Account Name</Label>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg mt-1">
                  <code className="text-lg font-mono flex-1">Top Grade Project LTD</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard('Top Grade Project LTD')}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Bank</Label>
                <div className="p-3 bg-muted rounded-lg mt-1">
                  <span className="text-lg font-medium">Access/Diamond Bank</span>
                </div>
              </div>
            </div>

            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <strong>After making the transfer:</strong> Send proof of payment and your Payment ID to{' '}
                <a 
                  href="mailto:support@jobprofile.com.ng" 
                  className="text-primary hover:underline"
                >
                  support@jobprofile.com.ng
                </a>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Online Payment Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Online Payment Options
            </CardTitle>
            <CardDescription>
              Pay securely online (temporarily unavailable)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                size="lg"
                className="h-16"
                onClick={() => handleOnlinePayment('flutterwave')}
                disabled
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Pay with Flutterwave
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="h-16"
                onClick={() => handleOnlinePayment('paystack')}
                disabled
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Pay with Paystack
              </Button>
            </div>
            
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Online payment is temporarily unavailable.</strong> Kindly use bank transfer while we finalize integration with Flutterwave and Paystack.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Upload Proof of Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Proof of Payment
            </CardTitle>
            <CardDescription>
              Upload your payment receipt or screenshot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="proof-file">Proof of Payment</Label>
              <Input
                id="proof-file"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Accepted formats: JPG, PNG, PDF (max 5MB)
              </p>
            </div>
            
            {proofFile && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">{proofFile.name}</span>
              </div>
            )}
            
            <Button
              onClick={handleUploadProof}
              disabled={!proofFile}
              className="w-full"
            >
              Upload Proof of Payment
            </Button>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                {payment.status.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {payment.status === 'pending' && 'Awaiting payment confirmation'}
                {payment.status === 'completed' && 'Payment confirmed'}
                {payment.status === 'failed' && 'Payment failed'}
                {payment.status === 'cancelled' && 'Payment cancelled'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/job-subscription')}
            className="w-full sm:w-auto"
          >
            Back to Subscriptions
          </Button>
          <Button
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto"
          >
            Career Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
} 