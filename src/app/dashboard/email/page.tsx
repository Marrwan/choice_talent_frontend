'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/lib/useToast';
import { useAuth } from '@/lib/store';
import { 
  ArrowLeft, 
  Mail, 
  Send, 
  Inbox, 
  Archive, 
  Trash2, 
  Search, 
  Plus,
  Reply,
  Forward,
  MoreHorizontal,
  Star,
  StarOff,
  Paperclip,
  X,
  Loader2
} from 'lucide-react';

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: Date;
  read: boolean;
  starred: boolean;
  folder: 'inbox' | 'sent' | 'draft' | 'trash';
  attachments?: string[];
}

export default function EmailPage() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<'inbox' | 'sent' | 'draft' | 'trash'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [composeEmail, setComposeEmail] = useState({
    to: '',
    subject: '',
    body: ''
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockEmails: Email[] = [
      {
        id: '1',
        from: 'recruiter@company.com',
        to: user?.email || '',
        subject: 'Interview Invitation - Software Engineer Position',
        body: 'Dear Candidate, We are pleased to invite you for an interview for the Software Engineer position...',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        starred: true,
        folder: 'inbox'
      },
      {
        id: '2',
        from: 'hr@techcorp.com',
        to: user?.email || '',
        subject: 'Application Status Update',
        body: 'Thank you for your interest in our company. We have reviewed your application...',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
        starred: false,
        folder: 'inbox'
      },
      {
        id: '3',
        from: user?.email || '',
        to: 'manager@startup.com',
        subject: 'Follow-up on Application',
        body: 'Hi, I wanted to follow up on my application for the Frontend Developer role...',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        read: true,
        starred: false,
        folder: 'sent'
      }
    ];
    setEmails(mockEmails);
  }, [user?.email]);

  const filteredEmails = emails.filter(email => {
    const matchesFolder = email.folder === selectedFolder;
    const matchesSearch = searchQuery === '' || 
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.to.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const handleCompose = () => {
    if ((user as any)?.subscriptionStatus !== 'premium' && !(user as any)?.isPremium) {
      toast.showError('Upgrade to Premium to compose new emails. Free users can only reply to existing conversations.', 'Premium Required');
      return;
    }
    setShowCompose(true);
    setComposeEmail({ to: '', subject: '', body: '' });
  };

  const handleSendEmail = async () => {
    if (!composeEmail.to || !composeEmail.subject || !composeEmail.body) {
      toast.showError('Please fill in all fields', 'Error');
      return;
    }

    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newEmail: Email = {
        id: Date.now().toString(),
        from: user?.email || '',
        to: composeEmail.to,
        subject: composeEmail.subject,
        body: composeEmail.body,
        timestamp: new Date(),
        read: true,
        starred: false,
        folder: 'sent'
      };

      setEmails(prev => [newEmail, ...prev]);
      setShowCompose(false);
      setComposeEmail({ to: '', subject: '', body: '' });
      toast.showSuccess('Email sent successfully!', 'Success');
    } catch (error) {
      toast.showError('Failed to send email', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    if (!email.read && email.folder === 'inbox') {
      setEmails(prev => prev.map(e => 
        e.id === email.id ? { ...e, read: true } : e
      ));
    }
  };

  const toggleStar = (emailId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, starred: !email.starred } : email
    ));
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Mail className="h-8 w-8 text-blue-600" />
                Email
              </h1>
              <p className="text-gray-600 mt-2">Manage your emails and communications</p>
            </div>
            <Button onClick={handleCompose} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Compose
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Button
                    variant={selectedFolder === 'inbox' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedFolder('inbox')}
                  >
                    <Inbox className="mr-2 h-4 w-4" />
                    Inbox
                    <Badge variant="secondary" className="ml-auto">
                      {emails.filter(e => e.folder === 'inbox' && !e.read).length}
                    </Badge>
                  </Button>
                  <Button
                    variant={selectedFolder === 'sent' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedFolder('sent')}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Sent
                  </Button>
                  <Button
                    variant={selectedFolder === 'draft' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedFolder('draft')}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Drafts
                  </Button>
                  <Button
                    variant={selectedFolder === 'trash' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedFolder('trash')}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Trash
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email List */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="capitalize">{selectedFolder}</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search emails..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredEmails.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No emails in {selectedFolder}</p>
                    </div>
                  ) : (
                    filteredEmails.map((email) => (
                      <div
                        key={email.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${
                          selectedEmail?.id === email.id ? 'bg-blue-50' : ''
                        } ${!email.read ? 'bg-blue-50' : ''}`}
                        onClick={() => handleEmailClick(email)}
                      >
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(email.id);
                            }}
                          >
                            {email.starred ? (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            ) : (
                              <StarOff className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {email.from.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium truncate ${
                                !email.read ? 'font-semibold' : ''
                              }`}>
                                {selectedFolder === 'sent' ? email.to : email.from}
                              </p>
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(email.timestamp)}
                              </span>
                            </div>
                            <p className={`text-sm truncate ${
                              !email.read ? 'font-semibold' : 'text-gray-600'
                            }`}>
                              {email.subject}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {email.body.substring(0, 100)}...
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Email Detail Dialog */}
        <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedEmail && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle>{selectedEmail.subject}</DialogTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Reply className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                      <Button variant="outline" size="sm">
                        <Forward className="h-4 w-4 mr-2" />
                        Forward
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {selectedEmail.from.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {selectedFolder === 'sent' ? selectedEmail.to : selectedEmail.from}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatTimestamp(selectedEmail.timestamp)}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{selectedEmail.body}</p>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Compose Dialog */}
        <Dialog open={showCompose} onOpenChange={setShowCompose}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Compose Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">To:</label>
                <Input
                  value={composeEmail.to}
                  onChange={(e) => setComposeEmail(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="recipient@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Subject:</label>
                <Input
                  value={composeEmail.subject}
                  onChange={(e) => setComposeEmail(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Email subject"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message:</label>
                <Textarea
                  value={composeEmail.body}
                  onChange={(e) => setComposeEmail(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Type your message here..."
                  rows={10}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setShowCompose(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendEmail} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
