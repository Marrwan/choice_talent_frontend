'use client';

import Link from 'next/link';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { serviceService } from '@/services/serviceService';
import { professionalCareerProfileService } from '@/services/professionalCareerProfileService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function EarnMyServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [overview, setOverview] = useState<string>('');
  const [availability, setAvailability] = useState<string[]>([]);
  const [pricing, setPricing] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string | undefined>(undefined);

  useEffect(() => {
    (async () => {
      try {
        const res = await serviceService.mine();
        if (res.success) {
          setServices(res.data || []);
          if (res.data && res.data.length > 0) {
            const first = res.data[0];
            setOverview(first.description || '');
            const avail: string[] = [];
            if (first.remoteAvailable) avail.push('Remote');
            if (first.location && first.location !== 'profile') avail.push('In person');
            setAvailability(avail);
            if (first.pricingAmount && first.pricingCurrency) {
              setPricing(`Starting at ${first.pricingCurrency} ${Number(first.pricingAmount).toFixed(2)}/hr`);
            }
          }
        }
        // Load professional profile for header
        try {
          const prof = await professionalCareerProfileService.getProfile();
          if (prof.success && prof.data && prof.data.profile) {
            setFullName(prof.data.profile.fullName || '');
            setProfilePicture(prof.data.profile.profilePicture || undefined);
          }
        } catch {}
      } catch {}
    })();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 pb-8">
      <NavigationHeader title="Services" />

      {/* Header: user avatar and name */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profilePicture} alt={fullName || 'User'} />
            <AvatarFallback>{(fullName || 'U').slice(0,1)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold">{fullName ? `${fullName}'s Services` : 'My Services'}</h1>
            {/* <div className="text-sm text-gray-600">Response time and rate not currently available</div> */}
          </div>
        </div>
        <Link href="/dashboard/earn/create">
          <Button size="sm" variant="outline">Edit page</Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-800 whitespace-pre-line">{overview || 'Add a description in your service details.'}</p>
          <div className="space-y-2">
            <div className="font-medium">Availability</div>
            <div className="text-gray-700 text-sm">{availability.length > 0 ? availability.join(' or ') : 'Remote or in person (configure in services)'}</div>
          </div>
          <div className="space-y-1">
            <div className="font-medium">Pricing</div>
            <div className="text-gray-700 text-sm">{pricing || 'Contact for pricing'}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Services provided</CardTitle>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-gray-600">You haven't added any services yet.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {services.map((s) => (
                <span key={s.id} className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full border">{s.serviceName}</span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* <Card className="mb-6">
        <CardHeader>
          <CardTitle>Media</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 text-sm mb-3">Add up to 8 media formats to showcase your work and experience.</p>
          <Button variant="outline">+ Add media</Button>
        </CardContent>
      </Card> */}

      {/* <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-gray-700">You haven’t received enough reviews to display an overall rating</div>
          <div className="flex items-center justify-between border rounded p-4">
            <div>
              <div className="font-medium">Invite past clients to review</div>
              <div className="text-sm text-gray-600">Consider past clients who can best speak to your abilities</div>
            </div>
            <Button>Invite to review</Button>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}


