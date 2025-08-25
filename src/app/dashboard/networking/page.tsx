'use client';
import { useEffect, useState } from 'react';
import { networkingService } from '@/services/networkingService';
import { useAuth } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { Search, Users, UserPlus, UserCheck, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/lib/useToast';

export default function NetworkingPage() {
  const [q, setQ] = useState('');
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const { showToast, showSuccess, showError } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [conns, reqs] = await Promise.all([
        networkingService.listConnections(),
        networkingService.listRequests(),
      ]);
      setConnections(conns);
      setRequests(reqs);
    } catch (error) {
      console.error('Failed to load networking data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const doSearch = async () => {
    if (!q.trim()) return;
    setSearchLoading(true);
    try {
      const res = await networkingService.search(q.trim());
      const connectionIds = new Set(connections.map((c:any) => c.connectedUser?.id));
      const pendingFrom = new Set(requests.filter((r:any) => r.sender?.id === user?.id).map((r:any) => r.receiver?.id));
      const pendingTo = new Set(requests.filter((r:any) => r.receiver?.id === user?.id).map((r:any) => r.sender?.id));
      const enriched = res.map((u:any) => ({
        ...u,
        isConnected: connectionIds.has(u.id),
        isPendingFrom: pendingFrom.has(u.id), // User sent request to this person
        isPendingTo: pendingTo.has(u.id), // User received request from this person
        isSelf: u.id === user?.id,
      }));
      setResults(enriched);
    } catch (error: any) {
      console.error('Search failed:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('unauthorized') || error.message.includes('401')) {
          showError("Please log in again to continue.", "Authentication Required");
        } else {
          showError("Unable to search for users. Please try again.", "Search Failed");
        }
      } else {
        showError("Unable to search for users. Please try again.", "Search Failed");
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const sendRequest = async (id: string) => {
    try {
      await networkingService.sendRequest(id);
      showSuccess("Your connection request has been sent successfully. You'll be notified when they respond.", "Connection Request Sent!");
      await load();
      await doSearch();
    } catch (error: any) {
      console.error('Failed to send request:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message === 'Request already pending') {
          showError("You've already sent a connection request to this person. Please wait for their response.", "Request Already Sent");
        } else if (error.message.includes('already connected')) {
          showError("You're already connected with this person.", "Already Connected");
        } else {
          showError("Unable to send connection request. Please try again.", "Failed to Send Request");
        }
      } else {
        showError("Unable to send connection request. Please try again.", "Failed to Send Request");
      }
    }
  };

  const act = async (id: string, action: 'accept'|'reject') => {
    try {
      await networkingService.actOnRequest(id, action);
      const actionText = action === 'accept' ? 'accepted' : 'rejected';
      const message = action === 'accept' 
        ? "You're now connected! You can view their posts and updates." 
        : "The connection request has been declined.";
      showSuccess(message, `Request ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`);
      await load();
    } catch (error: any) {
      console.error('Failed to act on request:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          showError("This connection request no longer exists or has already been processed.", "Request Not Found");
        } else if (error.message.includes('already processed')) {
          showError("This request has already been processed.", "Already Processed");
        } else {
          showError("Unable to process your request. Please try again.", "Action Failed");
        }
      } else {
        showError("Unable to process your request. Please try again.", "Action Failed");
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch();
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <NavigationHeader title="Networking" />
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search People
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input 
                placeholder="Search by name, email, or username..." 
                value={q} 
                onChange={(e) => setQ(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={searchLoading || !q.trim()}>
                {searchLoading ? 'Searching...' : 'Search'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Search Results ({results.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.map((u) => (
                <div key={u.id} className="flex items-center justify-between border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {u.profilePicture ? (
                        <img src={u.profilePicture} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <span className="text-gray-500 font-medium">{u.name?.charAt(0)?.toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-sm text-gray-500">{u.email}</div>
                      {u.username && <div className="text-xs text-gray-400">@{u.username}</div>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {u.isPendingTo && (
                      <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        <AlertCircle className="h-3 w-3" />
                        <span>Wants to connect</span>
                      </div>
                    )}
                    <Button 
                      size="sm" 
                      onClick={() => sendRequest(u.id)} 
                      disabled={u.isSelf || u.isConnected || u.isPendingFrom || u.isPendingTo}
                      variant={u.isConnected ? "secondary" : u.isPendingFrom ? "outline" : "default"}
                    >
                      {u.isSelf ? (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          You
                        </>
                      ) : u.isConnected ? (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          Connected
                        </>
                      ) : u.isPendingFrom ? (
                        <>
                          <Clock className="h-4 w-4 mr-1" />
                          Request Sent
                        </>
                      ) : u.isPendingTo ? (
                        <>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Accept Request
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Pending Requests Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Requests ({requests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No pending connection requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((r) => (
                  <div key={r.id} className="flex items-center justify-between border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {r.sender?.profilePicture ? (
                          <img src={r.sender.profilePicture} alt={r.sender.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <span className="text-gray-500 font-medium">{r.sender?.name?.charAt(0)?.toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{r.sender?.name}</div>
                        <div className="text-sm text-gray-500">{r.sender?.email}</div>
                        {r.sender?.username && <div className="text-xs text-gray-400">@{r.sender.username}</div>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => act(r.id, 'accept')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => act(r.id, 'reject')}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connections Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Connections ({connections.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : connections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No connections yet</p>
                <p className="text-sm text-gray-400 mt-2">Start by searching for people to connect with</p>
              </div>
            ) : (
              <div className="space-y-3">
                {connections.map((c) => (
                  <div key={c.id} className="flex items-center justify-between border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {c.connectedUser?.profilePicture ? (
                          <img src={c.connectedUser.profilePicture} alt={c.connectedUser.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <span className="text-gray-500 font-medium">{c.connectedUser?.name?.charAt(0)?.toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{c.connectedUser?.name}</div>
                        <div className="text-sm text-gray-500">{c.connectedUser?.email}</div>
                        {c.connectedUser?.username && <div className="text-xs text-gray-400">@{c.connectedUser.username}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <UserCheck className="h-4 w-4" />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


