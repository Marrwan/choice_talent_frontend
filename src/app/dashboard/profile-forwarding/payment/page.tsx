'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/lib/useToast';
import { 
  ArrowLeft,
  Crown,
  Building2,
  CreditCard,
  Mail,
  Upload,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function ProfileForwardingPaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [proofFile, setProofFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setProofFile(file);
  };

  const handleUploadProof = async () => {
    if (!proofFile) return;
    // Placeholder UX: we don't have a dedicated backend endpoint yet for profile-forwarding proof uploads
    toast({ title: 'Upload received', description: 'Thanks! Our team will verify your payment shortly.' });
    setProofFile(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push('/dashboard/profile-forwarding')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Profile Forwarding – Premium</h1>
          <p className="text-muted-foreground">Complete payment to activate 3 months of employer forwarding</p>
          <div className="flex justify-center">
            <Badge className="mt-2"><Crown className="h-4 w-4 mr-1" /> Premium</Badge>
          </div>
        </div>

        {/* Amount */}
        <Card>
          <CardHeader>
            <CardTitle>Amount</CardTitle>
            <CardDescription>One-time payment for 3 months forwarding</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">₦5,000</div>
          </CardContent>
        </Card>

        {/* Bank Transfer Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bank Transfer Details
            </CardTitle>
            <CardDescription>Transfer the amount to the account below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Account Number</Label>
                <div className="p-3 bg-muted rounded-lg mt-1">
                  <span className="text-lg font-medium">0055583458</span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Account Name</Label>
                <div className="p-3 bg-muted rounded-lg mt-1">
                  <span className="text-lg font-medium">Top Grade Project LTD</span>
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
                <strong>After transfer:</strong> Email your proof of payment to{' '}
                <a href="mailto:support@jobprofile.com.ng" className="text-primary hover:underline">support@jobprofile.com.ng</a>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Online Payment Notice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Online Payment
            </CardTitle>
            <CardDescription>Temporarily unavailable</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Online payment is currently unavailable. Kindly use bank transfer.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Upload Proof (client-side placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Proof of Payment
            </CardTitle>
            <CardDescription>Optional quick upload (or send via email)</CardDescription>
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
              <p className="text-sm text-muted-foreground mt-1">Accepted formats: JPG, PNG, PDF (max 5MB)</p>
            </div>
            {proofFile && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">{proofFile.name}</span>
              </div>
            )}
            <Button onClick={handleUploadProof} disabled={!proofFile} className="w-full">
              Upload Proof of Payment
            </Button>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push('/dashboard/profile-forwarding')} className="w-full sm:w-auto">
            Back to Profile Forwarding
          </Button>
          <Button onClick={() => router.push('/dashboard')} className="w-full sm:w-auto">
            Career Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}


