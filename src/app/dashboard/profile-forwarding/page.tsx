'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/lib/useToast';
import { useAuth } from '@/lib/store';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Users,
  Eye,
  Download,
  Send,
  Crown,
  Star
} from 'lucide-react';
import Link from 'next/link';

export default function ProfileForwardingPage() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<string>('basic'); // 'basic' or 'premium'

  useEffect(() => {
    // Simulate loading user's current plan
    setTimeout(() => {
      setCurrentPlan('basic');
      setLoading(false);
    }, 1000);
  }, []);

  const basicFeatures = [
    'Update your profile anytime',
    'Appear on profile search'
  ];

  const premiumFeatures = [
    'Update your profile anytime',
    'Free profile download',
    'Appear on profile search',
    'Profile assessment feedback',
    'Forwarding your profile to potential employers for 3 months'
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Profile Forwarding</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get your profile in front of potential employers with our profile forwarding service. 
            Choose the plan that best fits your career goals.
          </p>
        </div>

        {/* Current Plan Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Your Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">
                  {currentPlan === 'premium' ? 'Premium Plan' : 'Basic Plan'}
                </h3>
                <p className="text-muted-foreground">
                  {currentPlan === 'premium' 
                    ? 'Your profile is being forwarded to employers' 
                    : 'Free basic profile visibility'
                  }
                </p>
              </div>
              <Badge variant={currentPlan === 'premium' ? 'default' : 'secondary'}>
                {currentPlan === 'premium' ? 'Active' : 'Free'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Plans */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Plan */}
            <Card className={`${currentPlan === 'basic' ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">FREE BASIC</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="text-3xl font-bold text-blue-600">
                  ₦0
                </div>
                <div className="text-sm text-muted-foreground">
                  Always free
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {basicFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {currentPlan === 'basic' ? (
                  <Button className="w-full" variant="outline" disabled>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Current Plan
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Switch to Basic
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className={`${currentPlan === 'premium' ? 'ring-2 ring-purple-500' : 'border-purple-200'}`}>
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Crown className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">PREMIUM</CardTitle>
                <CardDescription>Advanced features for serious job seekers</CardDescription>
                <div className="text-3xl font-bold text-purple-600">
                  ₦5,000
                </div>
                <div className="text-sm text-muted-foreground">
                  3 months duration
                </div>
                <Badge variant="secondary" className="w-fit mx-auto">
                  <Star className="mr-1 h-3 w-3" />
                  Most Popular
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {premiumFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {currentPlan === 'premium' ? (
                  <Button className="w-full" variant="outline" disabled>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    className="w-full"
                    onClick={() => router.push('/dashboard/profile-forwarding/payment')}
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Premium
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Comparison</CardTitle>
            <CardDescription>
              See what's included in each plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-center py-3 px-4">Basic</th>
                    <th className="text-center py-3 px-4">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Update your profile anytime</td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Appear on profile search</td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Free profile download</td>
                    <td className="text-center py-3 px-4">
                      <XCircle className="h-5 w-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Profile assessment feedback</td>
                    <td className="text-center py-3 px-4">
                      <XCircle className="h-5 w-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Profile forwarding to employers</td>
                    <td className="text-center py-3 px-4">
                      <XCircle className="h-5 w-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How Profile Forwarding Works</CardTitle>
            <CardDescription>
              Our process for connecting you with potential employers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">1. Profile Review</h3>
                <p className="text-sm text-muted-foreground">
                  Our experts review and optimize your profile for maximum impact
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Send className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">2. Targeted Forwarding</h3>
                <p className="text-sm text-muted-foreground">
                  We forward your profile to relevant employers in your field
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">3. Direct Contact</h3>
                <p className="text-sm text-muted-foreground">
                  Employers can contact you directly through our platform
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Ready to Get Started?</h3>
              <p className="text-muted-foreground">
                Choose the plan that best fits your career goals and start getting noticed by employers.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/dashboard/career">
                  <Button variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Back to Career Dashboard
                  </Button>
                </Link>
                {currentPlan !== 'premium' && (
                  <Button onClick={() => router.push('/dashboard/profile-forwarding/payment')}>
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Premium
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 