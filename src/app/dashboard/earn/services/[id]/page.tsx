'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { serviceService } from '@/services/serviceService';
import { Image as ImageIcon, X, Upload, Edit, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ServiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [pricingAmount, setPricingAmount] = useState('');
  const [pricingCurrency, setPricingCurrency] = useState('USD');
  const [pricingType, setPricingType] = useState('hourly');
  const [remoteAvailable, setRemoteAvailable] = useState(false);
  const [allowMessages, setAllowMessages] = useState(true);
  const [status, setStatus] = useState('published');
  const [media, setMedia] = useState<File[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);
  const [existingMedia, setExistingMedia] = useState<string[]>([]);

  useEffect(() => {
    if (serviceId) {
      loadService();
    }
  }, [serviceId]);

  const loadService = async () => {
    try {
      setLoading(true);
      const response = await serviceService.getById(serviceId);
      if (response.success && response.data) {
        const serviceData = response.data;
        setService(serviceData);
        
        // Populate form fields
        setServiceName(serviceData.serviceName || '');
        setCategory(serviceData.category || '');
        setDescription(serviceData.description || '');
        setLocation(serviceData.location || '');
        setPricingAmount(serviceData.pricingAmount ? String(serviceData.pricingAmount) : '');
        setPricingCurrency(serviceData.pricingCurrency || 'USD');
        setPricingType(serviceData.pricingType || 'hourly');
        setRemoteAvailable(serviceData.remoteAvailable || false);
        setAllowMessages(serviceData.allowMessages !== false);
        setStatus(serviceData.status || 'published');
        setExistingMedia(serviceData.media || []);
      }
    } catch (error) {
      console.error('Error loading service:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + media.length > 8) {
      alert('Maximum 8 media files allowed');
      return;
    }
    
    const newMedia = [...media, ...files];
    setMedia(newMedia);
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setMediaPreview([...mediaPreview, ...newPreviews]);
  };

  const removeMedia = (index: number) => {
    const newMedia = media.filter((_, i) => i !== index);
    const newPreviews = mediaPreview.filter((_, i) => i !== index);
    setMedia(newMedia);
    setMediaPreview(newPreviews);
  };

  const removeExistingMedia = (index: number) => {
    const newExistingMedia = existingMedia.filter((_, i) => i !== index);
    setExistingMedia(newExistingMedia);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const payload = {
        category,
        serviceName,
        description,
        location,
        pricingAmount: pricingAmount ? Number(pricingAmount) : undefined,
        pricingCurrency,
        pricingType,
        remoteAvailable,
        allowMessages,
        status,
        media
      };

      const response = await serviceService.update(serviceId, payload);
      if (response.success) {
        setEditing(false);
        await loadService(); // Reload the service data
      }
    } catch (error) {
      console.error('Error saving service:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        const response = await serviceService.remove(serviceId);
        if (response.success) {
          router.push('/dashboard/earn/services');
        }
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <NavigationHeader title="Loading..." />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading service details...</div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto px-4 pb-8">
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
    <div className="max-w-4xl mx-auto px-4 pb-8">
      <NavigationHeader title={editing ? "Edit Service" : service.serviceName} />
      
      <div className="mb-4">
        <Link href="/dashboard/earn/services">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Service Details</CardTitle>
              <div className="flex gap-2">
                {!editing && (
                  <Button onClick={() => setEditing(true)} className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                )}
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Service Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name
                </label>
                {editing ? (
                  <Input
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="Enter service name"
                  />
                ) : (
                  <div className="text-lg font-semibold">{service.serviceName}</div>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                {editing ? (
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Enter category"
                  />
                ) : (
                  <div className="text-gray-800">{service.category}</div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                {editing ? (
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your service..."
                    className="min-h-[120px]"
                  />
                ) : (
                  <div className="text-gray-800 whitespace-pre-line">{service.description || 'No description provided'}</div>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                {editing ? (
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter location or 'Remote'"
                  />
                ) : (
                  <div className="text-gray-800">{service.location || 'Not specified'}</div>
                )}
              </div>

              {/* Pricing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pricing
                </label>
                {editing ? (
                  <div className="flex gap-2">
                    <select 
                      value={pricingCurrency} 
                      onChange={(e) => setPricingCurrency(e.target.value)}
                      className="border rounded px-3 py-2"
                    >
                      {['USD','NGN','EUR','GBP','KES','GHS','ZAR','CAD','AUD','INR','JPY','CNY','BRL','MXN','AED','SAR'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <Input
                      value={pricingAmount}
                      onChange={(e) => setPricingAmount(e.target.value)}
                      placeholder="Amount"
                      type="number"
                      className="w-32"
                    />
                    <select 
                      value={pricingType} 
                      onChange={(e) => setPricingType(e.target.value)}
                      className="border rounded px-3 py-2"
                    >
                      <option value="hourly">per hour</option>
                      <option value="daily">per day</option>
                      <option value="project">per project</option>
                    </select>
                  </div>
                ) : (
                  <div className="text-gray-800">
                    {service.pricingAmount && service.pricingCurrency 
                      ? `${service.pricingCurrency} ${Number(service.pricingAmount).toFixed(2)}/${service.pricingType || 'hourly'}`
                      : 'Contact for pricing'
                    }
                  </div>
                )}
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability
                </label>
                {editing ? (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={remoteAvailable} 
                        onChange={(e) => setRemoteAvailable(e.target.checked)} 
                      />
                      Available for remote work
                    </label>
                  </div>
                ) : (
                  <div className="text-gray-800">
                    {service.remoteAvailable ? 'Remote work available' : 'In-person only'}
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                {editing ? (
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="border rounded px-3 py-2"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                ) : (
                  <div className="text-gray-800 capitalize">{service.status}</div>
                )}
              </div>

              {/* Media */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Media ({existingMedia.length + media.length}/8)
                </label>
                
                {/* Existing Media */}
                {existingMedia.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    {existingMedia.map((url, index) => (
                      <div key={`existing-${index}`} className="relative">
                        <img 
                          src={url} 
                          alt={`Media ${index + 1}`} 
                          className="w-full h-24 object-cover rounded border"
                        />
                        {editing && (
                          <button
                            type="button"
                            onClick={() => removeExistingMedia(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* New Media */}
                {mediaPreview.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    {mediaPreview.map((preview, index) => (
                      <div key={`new-${index}`} className="relative">
                        <img 
                          src={preview} 
                          alt={`New Media ${index + 1}`} 
                          className="w-full h-24 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Upload Button */}
                {editing && (existingMedia.length + media.length) < 8 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                      id="media-upload"
                    />
                    <label htmlFor="media-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload media files</p>
                      <p className="text-xs text-gray-500">Images and videos supported</p>
                    </label>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {editing && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

                  {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/earn/create">
                  <Button className="w-full">+ Add New Service</Button>
                </Link>
                <Link href="/dashboard/earn/services">
                  <Button variant="outline" className="w-full">View All Services</Button>
                </Link>
                <Link href={`/dashboard/earn/services/request/${serviceId}`}>
                  <Button variant="outline" className="w-full">Request This Service</Button>
                </Link>
              </CardContent>
            </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${service.status === 'published' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {service.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-800">
                  {new Date(service.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="text-gray-800">
                  {new Date(service.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
