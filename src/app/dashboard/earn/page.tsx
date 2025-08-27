'use client';

import Link from 'next/link';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/store';

export default function EarnLandingPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto px-4 pb-8">
      <NavigationHeader title="Earn" />

      <Card>
        <CardHeader>
          <CardTitle>Career Platform: Earn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-800">
          <p className="text-base">
            Earn from your expertise, special skills, and talents by showcasing professional services on your profile.
            Set up your offerings, choose visibility, and connect with clients who are actively searching.
          </p>
          <div className="space-y-2">
            <div className="font-semibold">What you can do:</div>
            <ul className="list-disc pl-6 space-y-2">
              <li>Earn from your expertise, special skills, talents, etc.</li>
              <li>Tell us about those expertise, special skills, talents, etc.</li>
              <li>Give more details on your service engagement.</li>
              <li>Choose to display your services on your profile.</li>
              <li>Get found in search results when people look for services.</li>
              <li>Enable potential clients reach out to you from frequent search.</li>
            </ul>
          </div>

          <div className="pt-2">
            <Link href="/dashboard/earn/create" className="inline-block">
              <Button size="lg">Proceed</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


