'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Settings, Mail, Rocket, ArrowLeft } from 'lucide-react';

export default function AppAIIntroPage() {
  const benefits = [
    '24/7 assistance and support',
    'Light speed applications for new openings',
    'Profile matching with relevant opportunities',
    'Professional career profile forwarding',
    'Automated reference information handling',
    'Automated follow-up on applications',
    'Comprehensive activity reports',
    'Users can be in charge without being online'
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
          <h1 className="text-3xl font-bold text-gray-900">AppAI — Automated Job Hunting & Applications</h1>
          <p className="text-gray-600">Hire an AI Robot to job hunt and apply for you for 30 days.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What you get</CardTitle>
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
          <Link href="/dashboard/job-hunting-settings">
            <Button className="h-12">
              Proceed
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


