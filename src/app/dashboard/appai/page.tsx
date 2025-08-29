'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Settings, Mail, Rocket, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/lib/useToast';

export default function AppAIIntroPage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  
  const benefits = [
    'Dedicated tech support and assistance',
    'Real time applications for new openings',
    'Profile matching with relevant opportunities',
    'Professional career profile forwarding',
    'Secure reference information handling',
    'Feedback and follow-up on applications',
    'Comprehensive activity reports',
    'Send applications without being online',
    'Save time sieving from multiple job listings',
    // '24/7 assistance and support',
    // 'Light speed applications for new openings',
    // 'Profile matching with relevant opportunities',
    // 'Professional career profile forwarding',
    // 'Automated reference information handling',
    // 'Automated follow-up on applications',
    // 'Comprehensive activity reports',
    // 'Users can be in charge without being online'
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <div className="flex justify-start">
          <Link href="/dashboard">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-2">
            <Rocket className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AppAI — Job Hunting Made Easy</h1>
          <p className="text-gray-600">Use a robot to hunt and apply for opportunities.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>AppAI Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {benefits.map((b) => (
                <li key={b} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            className="h-12"
            onClick={() => {
              if ((user as any)?.subscriptionStatus !== 'premium' && !(user as any)?.isPremium) {
                toast.showError('AppAI subscription required. This premium AI-powered service helps optimize your job search and career profile. Please subscribe to continue.', 'Premium Required');
                router.push('/dashboard/subscription');
                return;
              }
              router.push('/dashboard/job-hunting-settings');
            }}
          >
            Proceed
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}


