'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const CURRENCIES = ['USD','NGN','EUR','GBP','KES','GHS','ZAR','CAD','AUD','INR','JPY','CNY','BRL','MXN','AED','SAR'];

export default function EarnServiceDetailsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [about, setAbout] = useState('');
  const [useProfileLocation, setUseProfileLocation] = useState(true);
  const [remote, setRemote] = useState(true);
  const [contactForPrice, setContactForPrice] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [rate, setRate] = useState('');
  const [allowMessages, setAllowMessages] = useState(true);

  const category = params.get('category') || '';
  const service = params.get('service') || '';

  const onPublish = async () => {
    // Placeholder: integrate with backend in later steps
    router.push('/dashboard/earn/services');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-8">
      <NavigationHeader title="Service Details" />

      <Card>
        <CardHeader>
          <CardTitle>Tell us about your service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="text-sm text-gray-600">Category</div>
              <div className="font-medium">{category || '—'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Service</div>
              <div className="font-medium">{service || '—'}</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">About</label>
            <Textarea
              placeholder="Describe your expertise, experience, what makes you stand out, and typical deliverables."
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="min-h-[140px]"
            />
          </div>

          <div className="space-y-2">
            <div className="font-medium">Work Location</div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={useProfileLocation} onChange={(e)=>setUseProfileLocation(e.target.checked)} />
              Use current profile location
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={remote} onChange={(e)=>setRemote(e.target.checked)} />
              Available to work remotely
            </label>
          </div>

          <div className="space-y-2">
            <div className="font-medium">Pricing</div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!contactForPrice} onChange={(e)=>setContactForPrice(!e.target.checked)} />
              Starting from
            </label>
            {!contactForPrice && (
              <div className="flex items-center gap-2">
                <select className="border rounded px-2 py-2" value={currency} onChange={(e)=>setCurrency(e.target.value)}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <Input placeholder="Hourly rate" value={rate} onChange={(e)=>setRate(e.target.value)} className="w-40" />
              </div>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={contactForPrice} onChange={(e)=>setContactForPrice(e.target.checked)} />
              Contact for pricing
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={allowMessages} onChange={(e)=>setAllowMessages(e.target.checked)} />
              Allow non-network users to message you
            </label>
          </div>

          <div className="pt-2">
            <Button onClick={onPublish}>Publish</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


