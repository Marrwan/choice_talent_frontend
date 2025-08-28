'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { serviceService } from '@/services/serviceService';
import { serviceRequestService } from '@/services/serviceRequestService';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ServiceRequestPage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.serviceId as string;

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [budgetCurrency, setBudgetCurrency] = useState('USD');
  const [timeline, setTimeline] = useState('');

  useEffect(() => {
    if (serviceId) {
      loadService();
    }
  }, [serviceId]);

  const loadService = async () => {
    try {
      setLoading(true);
      const response = await serviceService.getById(serviceId);
      if (response && response.success && response.data) {
        setService(response.data);
      }
    } catch (error) {
      console.error('Error loading service:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      const payload = {
        serviceId,
        title: title.trim(),
        description: description.trim(),
        budget: budget ? Number(budget) : undefined,
        budgetCurrency: budget ? budgetCurrency : undefined,
        timeline: timeline.trim() || undefined
      };

      const response = await serviceRequestService.create(payload);
      if (response && response.success) {
        alert('Service request sent successfully!');
        router.push('/dashboard/earn/services');
      }
    } catch (error) {
      console.error('Error creating service request:', error);
      alert('Failed to send service request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <NavigationHeader title="Loading..." />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading service details...</div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <NavigationHeader title="Service Not Found" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-gray-500 mb-4">Service not found</div>
            <Link href="/dashboard/earn/services">
              <Button>Back to Services</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-8">
      <NavigationHeader title="Request Service" />
      
      <div className="mb-4">
        <Link href="/dashboard/earn/services">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">{service.serviceName}</h3>
              <p className="text-sm text-gray-600">{service.category}</p>
            </div>
            
            {service.description && (
              <div>
                <p className="text-gray-800">{service.description}</p>
              </div>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {service.pricingAmount && service.pricingCurrency && (
                <span>
                  {service.pricingCurrency} {Number(service.pricingAmount).toFixed(2)}/{service.pricingType || 'hourly'}
                </span>
              )}
              {service.remoteAvailable && (
                <span>Remote work available</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Send Service Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your project"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Description *
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project requirements, goals, and any specific details..."
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget (Optional)
                </label>
                <div className="flex gap-2">
                  <select 
                    value={budgetCurrency} 
                    onChange={(e) => setBudgetCurrency(e.target.value)}
                    className="border rounded px-3 py-2"
                  >
                    {['USD','NGN','EUR','GBP','KES','GHS','ZAR','CAD','AUD','INR','JPY','CNY','BRL','MXN','AED','SAR'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <Input
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Amount"
                    type="number"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeline (Optional)
                </label>
                <Input
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  placeholder="e.g., 2 weeks, 1 month, ASAP"
                />
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? 'Sending Request...' : 'Send Service Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
