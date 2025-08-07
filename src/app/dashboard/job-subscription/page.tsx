'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/lib/useToast';
import jobSubscriptionService, { 
  SubscriptionPackage, 
  EligibilityResponse,
  JobSubscription 
} from '@/services/jobSubscriptionService';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export default function JobSubscriptionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(null);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [subscriptions, setSubscriptions] = useState<JobSubscription[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load eligibility and packages in parallel
      const [eligibilityData, packagesData, subscriptionsData] = await Promise.all([
        jobSubscriptionService.checkEligibility().catch(() => null),
        jobSubscriptionService.getSubscriptionPackages(),
        jobSubscriptionService.getUserSubscriptions()
      ]);

      setEligibility(eligibilityData);
      setPackages(packagesData);
      setSubscriptions(subscriptionsData);
    } catch (error) {
      console.error('Error loading job subscription data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load job subscription data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = (pkg: SubscriptionPackage) => {
    setSelectedPackage(pkg);
  };

  const handleOrder = async (pkg: SubscriptionPackage) => {
    try {
      // Create subscription
      const { subscription } = await jobSubscriptionService.createSubscription({
        subscriptionType: pkg.id
      });

      // Create payment
      const { payment } = await jobSubscriptionService.createPayment({
        subscriptionId: subscription.id,
        paymentMethod: 'bank_transfer' // Default to bank transfer
      });

      // Navigate to payment details page
      router.push(`/dashboard/job-subscription/payment/${payment.paymentId}`);
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to create subscription. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const getPackageDisplayName = (pkg: SubscriptionPackage) => {
    switch (pkg.id) {
      case '0-2_years':
        return '0 – 2 years of Work Experience';
      case '3-5_years':
        return '3 – 5 years of Work Experience';
      case '6-7_years':
        return '6 – 7 years of Work Experience';
      case '10_plus_years':
        return '10+ years of Work Experience';
      default:
        return pkg.name;
    }
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

  // If not eligible, show requirements
  if (!eligibility?.isEligible) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Job Subscription Not Available
            </CardTitle>
            <CardDescription>
              You need to complete certain requirements before accessing job subscription features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Requirements to access job subscription:</strong>
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Complete your career profile</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/dashboard/professional-career-profile')}
                  >
                    Complete Profile
                  </Button>
                </div>
                
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Set your job hunting preferences</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/dashboard/job-hunting-settings')}
                  >
                    Set Preferences
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If has active subscription, show subscription details
  if (eligibility.hasActiveSubscription && eligibility.activeSubscription) {
    const activeSub = eligibility.activeSubscription;
    const startDate = new Date(activeSub.startDate).toLocaleDateString();
    const endDate = new Date(activeSub.endDate).toLocaleDateString();

    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Active Subscription
            </CardTitle>
            <CardDescription>
              You currently have an active subscription.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Subscription Type</label>
                  <p className="text-lg font-semibold">{activeSub.subscriptionType.replace('_', ' ').replace('-', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge variant="default" className="ml-2">
                    {activeSub.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                  <p className="text-lg">{startDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">End Date</label>
                  <p className="text-lg">{endDate}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Your Subscription Benefits:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Career advisory
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Profile screening
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Job application feedback
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Profile assessment feedback
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Forwarding your profile to potential employers
                  </li>
                </ul>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => router.push('/dashboard/job-subscription/activity')}
                >
                  View Activity Log
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/dashboard/career')}
                >
                  Career Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Profile Forwarding</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Get your profile in front of employers with our Profile Forwarding service. We'll help you stand out and advance your career.</p>
        </div>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Benefits</CardTitle>
            <CardDescription>
              All packages include the following professional services:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Career Advisory</h3>
                <p className="text-sm text-muted-foreground">
                  Professional guidance to help you make informed career decisions
                </p>
              </div>
              <div className="space-y-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Profile Screening</h3>
                <p className="text-sm text-muted-foreground">
                  Expert review and optimization of your professional profile
                </p>
              </div>
              <div className="space-y-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Job Application Feedback</h3>
                <p className="text-sm text-muted-foreground">
                  Detailed feedback on your job applications and interview preparation
                </p>
              </div>
              <div className="space-y-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Profile Assessment</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive assessment of your skills and experience
                </p>
              </div>
              <div className="space-y-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Profile Forwarding</h3>
                <p className="text-sm text-muted-foreground">
                  Direct forwarding of your profile to potential employers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Packages */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">Choose Your Package</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`cursor-pointer transition-all ${
                  selectedPackage?.id === pkg.id 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:shadow-lg'
                }`}
                onClick={() => handleSelectPackage(pkg)}
              >
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">{getPackageDisplayName(pkg)}</CardTitle>
                  <CardDescription>Professionals with {getPackageDisplayName(pkg)}</CardDescription>
                  <div className="text-3xl font-bold text-primary">
                    ₦{(pkg.price / 100).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {pkg.duration / 30} months
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOrder(pkg);
                    }}
                  >
                    Click Here to Order
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Existing Subscriptions */}
        {subscriptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Subscription History</CardTitle>
              <CardDescription>
                View your previous and current subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subscriptions.map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold">
                        {subscription.subscriptionType === '0-2_years' ? '0 – 2 years of Work Experience' :
                         subscription.subscriptionType === '3-5_years' ? '3 – 5 years of Work Experience' :
                         subscription.subscriptionType === '6-7_years' ? '6 – 7 years of Work Experience' :
                         subscription.subscriptionType === '10_plus_years' ? '10+ years of Work Experience' :
                         subscription.subscriptionType.replace('_', ' ').replace('-', ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ₦{(subscription.price / 100).toLocaleString()} • {subscription.duration / 30} months
                      </p>
                    </div>
                    <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                      {subscription.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 