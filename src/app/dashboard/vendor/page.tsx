'use client';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function VendorPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6">
      <NavigationHeader title="Vendor" />
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Vendor Services</CardTitle>
          </CardHeader>
          <CardContent>
            Coming soon: create and manage your services.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


