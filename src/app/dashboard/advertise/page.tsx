'use client';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AdvertisePage() {
  return (
    <div className="container mx-auto p-4 sm:p-6">
      <NavigationHeader title="Advertise" />
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Advertising</CardTitle>
          </CardHeader>
          <CardContent>
            Coming soon: create and manage ads.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


