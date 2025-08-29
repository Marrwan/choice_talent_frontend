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
        <CardContent className="space-y-5 text-gray-800">
          {/* Intro */}
          <div className="space-y-3">
            <p className="text-base leading-relaxed">
              Earn from your expertise, special skills, and talents by showcasing professional services on your profile.
              Set up your offerings, choose visibility, and connect with clients who are actively searching.
            </p>
            <div className="rounded-lg bg-gray-50 border p-4 sm:p-5">
              <p className="text-sm sm:text-base leading-relaxed">
                As professionals, not all your expertise, skills or talents are documented on your resume, right?
                The services section helps you reactivate and deploy dormant expertise, skills and talents for patronage.
                Now you don’t have to depend on paid employment alone—sell your talent in service to people who want to
                accomplish goals or execute projects rather than employ.
              </p>
            </div>
          </div>

          {/* What you can do */}
          <div className="space-y-2">
            <div className="font-semibold">What you can do:</div>
            <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
              <li>Tell us about your expertise, special skills and talents.</li>
              <li>Provide details of your service engagement and availability.</li>
              <li>Choose to display your services on your profile.</li>
              <li>Get found in search results when people look for services.</li>
              <li>Enable potential clients to reach out to you from frequent search.</li>
            </ul>
          </div>

          {/* Examples */}
          <div className="space-y-3">
            <div className="font-semibold">Examples</div>
            <div className="grid gap-3 sm:gap-4">
              <div className="rounded-lg border p-3 sm:p-4 bg-white">
                <div className="font-medium">Make-up Artist</div>
                <p className="text-sm text-gray-700 leading-relaxed mt-1">
                  Enlist your skill in helping people boost their confidence through skilful facial artistry—share details of your expertise with pictures to convince prospects.
                </p>
              </div>
              <div className="rounded-lg border p-3 sm:p-4 bg-white">
                <div className="font-medium">Fitness Coach</div>
                <p className="text-sm text-gray-700 leading-relaxed mt-1">
                  Guide individuals to become fit and back in shape again, boosting their presentation and appearance, with image proofs of sessions and success stories.
                </p>
              </div>
              <div className="rounded-lg border p-3 sm:p-4 bg-white">
                <div className="font-medium">Graphics Design Expert</div>
                <p className="text-sm text-gray-700 leading-relaxed mt-1">
                  Consult and sell your skill to individuals, groups or small businesses looking to engage you for gigs and side hustles.
                </p>
              </div>
              <div className="rounded-lg border p-3 sm:p-4 bg-white">
                <div className="font-medium">Interview Success Coach</div>
                <p className="text-sm text-gray-700 leading-relaxed mt-1">
                  Guide career professionals seeking to improve and optimize their interview experience and results.
                </p>
              </div>
              <div className="rounded-lg border p-3 sm:p-4 bg-white">
                <div className="font-medium">DJ / MC</div>
                <p className="text-sm text-gray-700 leading-relaxed mt-1">
                  Enlist your special talent for events and ceremonies, with pictures highlighting your experience.
                </p>
              </div>
              <div className="rounded-lg border p-3 sm:p-4 bg-white">
                <div className="font-medium">Quantity Surveyor</div>
                <p className="text-sm text-gray-700 leading-relaxed mt-1">
                  Share details of your expertise to unlock new opportunities from people undertaking personal building projects.
                </p>
              </div>
              <div className="rounded-lg border p-3 sm:p-4 bg-white">
                <div className="font-medium">Creative Writer</div>
                <p className="text-sm text-gray-700 leading-relaxed mt-1">
                  Showcase your niche writing experience and professionalism; offer your expertise to individuals undertaking personal projects.
                </p>
              </div>
              <div className="rounded-lg border p-3 sm:p-4 bg-white">
                <div className="font-medium">Professional Recruiter</div>
                <p className="text-sm text-gray-700 leading-relaxed mt-1">
                  Help small businesses find and assess the right talents they need for team building and growth.
                </p>
              </div>
              <div className="rounded-lg border p-3 sm:p-4 bg-white">
                <div className="font-medium">Interior Designer</div>
                <p className="text-sm text-gray-700 leading-relaxed mt-1">
                  Offer your expertise to individuals looking to redesign their homes or personal spaces.
                </p>
              </div>
              <div className="rounded-lg border p-3 sm:p-4 bg-white">
                <div className="font-medium">Business Growth Specialist</div>
                <p className="text-sm text-gray-700 leading-relaxed mt-1">
                  Enlist your expertise in service to micro, small and medium scale businesses.
                </p>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              PS: Most global businesses started by selling small services or products.
            </div>
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


