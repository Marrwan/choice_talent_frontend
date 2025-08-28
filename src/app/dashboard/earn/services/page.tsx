'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { serviceService } from '@/services/serviceService';
import { serviceRequestService, ServiceRequest } from '@/services/serviceRequestService';
import { professionalCareerProfileService } from '@/services/professionalCareerProfileService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Home, 
  Settings, 
  MessageSquare, 
  Calendar, 
  Star,
  User,
  MapPin,
  Users,
  Edit,
  Trash2
} from 'lucide-react';

export default function EarnMyServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [overview, setOverview] = useState<string>('');
  const [availability, setAvailability] = useState<string[]>([]);
  const [pricing, setPricing] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string | undefined>(undefined);
  const [currentPosition, setCurrentPosition] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [connectionsCount, setConnectionsCount] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<string>('home');

  useEffect(() => {
    (async () => {
      try {
        const res = await serviceService.mine();
        if (res.success && res.data) {
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
            const profile = prof.data.profile;
            setFullName(profile.fullName || '');
            setProfilePicture(profile.profilePicture || undefined);
            
            // Get current position from work experience
            if (profile.workExperiences && profile.workExperiences.length > 0) {
              const mostRecent = profile.workExperiences[0];
              setCurrentPosition(`${mostRecent.designation || ''}${mostRecent.companyName ? ` at ${mostRecent.companyName}` : ''}`);
            }
            
            // Get location
            setLocation(profile.stateOfResidence || '');
            
            // Set connections count (placeholder for now)
            setConnectionsCount(0);
          }
        } catch {}
      } catch {}
    })();
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <NavigationHeader title="Services" />
        
        {/* Main Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - User Profile & Navigation */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* User Profile Card */}
            <Card>
              <CardContent className="space-y-4 p-0">
                <div className="relative rounded-xl overflow-hidden bg-gray-100">
                  <div className="w-full h-20 sm:h-32 bg-gray-100 flex items-center justify-center relative">
                    <div className="absolute -bottom-8 sm:-bottom-10 left-4 sm:left-6 z-10">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white overflow-hidden bg-gray-200 shadow">
                        {profilePicture ? (
                          <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="px-4 sm:px-6 pt-8 sm:pt-10 pb-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-semibold leading-tight text-gray-900 w-full">{fullName || 'User'}</h2>
                      </div>
                      {currentPosition && (
                        <p className="text-base text-gray-800 font-medium">{currentPosition}</p>
                      )}
                      {/* {location && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="h-4 w-4" /> {location}
                        </p>
                      )} */}
                      {/* <p className="text-sm text-gray-700">{connectionsCount >= 500 ? '500+ connections' : `${connectionsCount} connections`}</p> */}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services Navigation */}
            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant={activeSection === 'home' ? 'default' : 'outline'} 
                  className="w-full justify-start h-12"
                  onClick={() => setActiveSection('home')}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Home Page
                </Button>

                <Button 
                  variant={activeSection === 'manage' ? 'default' : 'outline'} 
                  className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50"
                  onClick={() => setActiveSection('manage')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Services
                </Button>

                <Button 
                  variant={activeSection === 'requests' ? 'default' : 'outline'} 
                  className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50"
                  onClick={() => setActiveSection('requests')}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Manage Requests
                </Button>

                <Button 
                  variant={activeSection === 'meetings' ? 'default' : 'outline'} 
                  className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50"
                  onClick={() => setActiveSection('meetings')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Manage Meetings
                </Button>

                <Button 
                  variant={activeSection === 'reviews' ? 'default' : 'outline'} 
                  className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50"
                  onClick={() => setActiveSection('reviews')}
                >
                  <Star className="mr-2 h-4 w-4" />
                  Review Status
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {activeSection === 'home' && (
              <>
                <Card>
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

                <Card>
                  <CardHeader>
                    <CardTitle>Services provided</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {services.length === 0 ? (
                      <div className="text-gray-600">You haven't added any services yet.</div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {services.map((s) => (
                          <Link 
                            key={s.id} 
                            href={`/dashboard/earn/services/${s.id}`}
                            className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full border hover:bg-gray-200 transition-colors cursor-pointer"
                          >
                            {s.serviceName}
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">No reviews yet.</p>
                    <Link href="/dashboard/networking">
                      <Button variant="outline" className="mt-2">Invite connections to review</Button>
                    </Link>
                  </CardContent>
                </Card>
              </>
            )}

            {activeSection === 'manage' && (
              <ManageServicesSection services={services} />
            )}

            {activeSection === 'requests' && (
              <ManageRequestsSection />
            )}

            {activeSection === 'meetings' && (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Meetings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Meeting management features coming soon.</p>
                  <Link href="/dashboard/meetings">
                    <Button variant="outline" className="mt-2">Go to Meetings</Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {activeSection === 'reviews' && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">No reviews yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Manage Services Section Component
function ManageServicesSection({ services }: { services: any[] }) {
  const router = useRouter();

  const handleEditService = (serviceId: string) => {
    router.push(`/dashboard/earn/services/${serviceId}`);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        const response = await serviceService.remove(serviceId);
        if (response && response.success) {
          window.location.reload(); // Refresh to update the list
        }
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Services</CardTitle>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">You haven't added any services yet.</p>
            <Link href="/dashboard/earn/create">
              <Button>+ Add Services</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">{services.length} service(s)</p>
              <Link href="/dashboard/earn/create">
                <Button>+ Add New Service</Button>
              </Link>
            </div>
            
            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{service.serviceName}</h3>
                      <p className="text-sm text-gray-600 mb-2">{service.category}</p>
                      <p className="text-gray-800 text-sm line-clamp-2">
                        {service.description || 'No description provided'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          service.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {service.status}
                        </span>
                        {service.pricingAmount && service.pricingCurrency && (
                          <span>
                            {service.pricingCurrency} {Number(service.pricingAmount).toFixed(2)}/{service.pricingType || 'hourly'}
                          </span>
                        )}
                        {service.remoteAvailable && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Remote
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditService(service.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteService(service.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Manage Requests Section Component
function ManageRequestsSection() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await serviceRequestService.getProviderRequests(filter === 'all' ? undefined : filter);
      if (response && response.success) {
        setRequests(response.data || []);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await serviceRequestService.accept(requestId);
      if (response && response.success) {
        await loadRequests(); // Reload the list
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDeclineRequest = async (requestId: string, reason?: string) => {
    try {
      const response = await serviceRequestService.decline(requestId, reason);
      if (response && response.success) {
        await loadRequests(); // Reload the list
      }
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-500">Loading requests...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex gap-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button 
              variant={filter === 'pending' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('pending')}
            >
              Pending
            </Button>
            <Button 
              variant={filter === 'accepted' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('accepted')}
            >
              Accepted
            </Button>
            <Button 
              variant={filter === 'declined' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('declined')}
            >
              Declined
            </Button>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No service requests found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={request.requester?.profilePicture} />
                      <AvatarFallback>
                        {(request.requester?.realName || request.requester?.name || 'U')
                          .split(' ')
                          .map((s) => s[0])
                          .slice(0, 2)
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {request.requester?.realName || request.requester?.name || 'User'}
                      </h3>
                      <p className="text-sm text-gray-600">{request.service?.serviceName}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                <div className="mb-3">
                  <h4 className="font-medium mb-1">{request.title}</h4>
                  <p className="text-gray-700 text-sm">{request.description}</p>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  {request.budget && request.budgetCurrency && (
                    <span>Budget: {request.budgetCurrency} {Number(request.budget).toFixed(2)}</span>
                  )}
                  {request.timeline && (
                    <span>Timeline: {request.timeline}</span>
                  )}
                  <span>Requested: {new Date(request.createdAt).toLocaleDateString()}</span>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => handleAcceptRequest(request.id)}
                    >
                      Accept & Start Chat
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const reason = prompt('Please provide a reason for declining:');
                        if (reason !== null) {
                          handleDeclineRequest(request.id, reason);
                        }
                      }}
                    >
                      Decline
                    </Button>
                  </div>
                )}

                {request.status === 'accepted' && request.conversationId && (
                  <div className="flex gap-2">
                    <Link href={`/dashboard/chat/${request.conversationId}`}>
                      <Button size="sm">
                        Open Chat
                      </Button>
                    </Link>
                  </div>
                )}

                {request.status === 'declined' && request.declineReason && (
                  <div className="text-sm text-gray-600 mt-2">
                    <strong>Decline reason:</strong> {request.declineReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


