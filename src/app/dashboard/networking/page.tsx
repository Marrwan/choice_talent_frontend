'use client';
import { useEffect, useState } from 'react';
import { networkingService } from '@/services/networkingService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NavigationHeader } from '@/components/ui/navigation-header';

export default function NetworkingPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  const load = async () => {
    const [conns, reqs] = await Promise.all([
      networkingService.listConnections(),
      networkingService.listRequests(),
    ]);
    setConnections(conns);
    setRequests(reqs);
  };

  useEffect(() => { load(); }, []);

  const doSearch = async () => {
    if (!q.trim()) return;
    const res = await networkingService.search(q.trim());
    setResults(res);
  };

  const sendRequest = async (id: string) => {
    await networkingService.sendRequest(id);
    await load();
  };

  const act = async (id: string, action: 'accept'|'reject') => {
    await networkingService.actOnRequest(id, action);
    await load();
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <NavigationHeader title="Networking" />
      <div className="max-w-4xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Search</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input placeholder="Search people" value={q} onChange={(e) => setQ(e.target.value)} />
            <Button onClick={doSearch}>Search</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {results.map((u) => (
              <div key={u.id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-sm text-gray-500">{u.email}</div>
                </div>
                <Button size="sm" onClick={() => sendRequest(u.id)}>Connect</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="font-medium">{r.sender?.name}</div>
                  <div className="text-sm text-gray-500">{r.sender?.email}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => act(r.id, 'accept')}>Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => act(r.id, 'reject')}>Reject</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {connections.map((c) => (
              <div key={c.id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="font-medium">{c.connectedUser?.name}</div>
                  <div className="text-sm text-gray-500">{c.connectedUser?.email}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


