'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowRight, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { jobSubscriptionService } from '@/services/jobSubscriptionService';
import { useToast } from '@/lib/useToast';

export default function AppAIActivatePage() {
  const router = useRouter();
  const toast = useToast();

  const handleActivate = async () => {
    try {
      const { subscription } = await jobSubscriptionService.createSubscription({ subscriptionType: 'appai_30_days' });
      toast.showSuccess('AppAI created. Proceed to payment.', 'Success');
      router.push(`/dashboard/appai/payment?sid=${subscription.id}`);
    } catch (e) {
      console.error(e);
      toast.showError('Failed to initialize AppAI subscription', 'Error');
    }
  };
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Activate AppAI</h1>
          <p className="text-gray-600 mt-2">Confirm your details and activate AppAI for 30 days.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Before you activate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center">
              <ShieldCheck className="h-5 w-5 text-green-600 mr-2" />
              Ensure your Job Hunting Settings are accurate.
            </div>
            <div className="flex items-center">
              <ShieldCheck className="h-5 w-5 text-green-600 mr-2" />
              Your professional profile will be forwarded as part of applications.
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Link href="/dashboard/job-hunting-settings">
            <Button variant="outline" className="h-12">
              Review Settings
            </Button>
          </Link>
          <Button onClick={handleActivate} className="h-12">
            Activate AppAI
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}


