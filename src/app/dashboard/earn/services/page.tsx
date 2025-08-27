'use client';

import Link from 'next/link';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EarnMyServicesPage() {
  // Placeholder list; will be wired to backend later
  const services: { id: string; name: string; status: 'published'|'draft' }[] = [];

  return (
    <div className="max-w-4xl mx-auto px-4 pb-8">
      <NavigationHeader title="My Services" />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Services</CardTitle>
          <Link href="/dashboard/earn/create">
            <Button size="sm" variant="outline">+ Add Services</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-gray-600">You haven't added any services yet.</div>
          ) : (
            <div className="space-y-3">
              {services.map(s => (
                <div key={s.id} className="border rounded p-4 flex items-center justify-between">
                  <div className="font-medium">{s.name}</div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${s.status==='published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{s.status === 'published' ? 'Published' : 'Draft'}</span>
                    <Link href={{ pathname: '/dashboard/earn/details', query: { edit: s.id } }}>
                      <Button size="sm" variant="outline">Edit</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


