'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/store';
import { meetingService, Meeting, CreateMeetingData, UpdateMeetingData, Invitation } from '@/services/meetingService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/lib/useToast';
import { 
  Calendar,
  Clock,
  Users,
  Video,
  Plus,
  Edit,
  Trash2,
  Mail,
  Loader2,
  ChevronDown,
  ChevronUp,
  Grid3X3,
  List
} from 'lucide-react';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { socketService } from '@/services/socketService';
import { tokenManager } from '@/lib/api';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function MeetingsPage() {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);
  const [expandedMeetings, setExpandedMeetings] = useState<Set<string>>(new Set());
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComments, setSubmittingComments] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  
  // New state for edit and invite functionality
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [invitingMeeting, setInvitingMeeting] = useState<Meeting | null>(null);
  const [newParticipants, setNewParticipants] = useState<Array<{ userId?: string; email?: string }>>([]);
  const [updating, setUpdating] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [showDayModal, setShowDayModal] = useState(false);
  const [dayMeetings, setDayMeetings] = useState<Meeting[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  
  const [newMeeting, setNewMeeting] = useState<CreateMeetingData>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    participants: []
  });

  const [editMeeting, setEditMeeting] = useState<UpdateMeetingData>({
    title: '',
    description: '',
    startTime: '',
    endTime: ''
  });

  // Load meetings
  const loadMeetings = async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      const response = await meetingService.getMeetings(page);
      
      if (append) {
        setMeetings(prev => [...prev, ...response.meetings]);
      } else {
        setMeetings(response.meetings);
      }
      
      setHasNextPage(response.pagination.hasNextPage);
      setCurrentPage(response.pagination.currentPage);
    } catch (error) {
      console.error('Error loading meetings:', error);
      showError("Failed to load meetings", "Error");
    } finally {
      setLoading(false);
    }
  };

  // Load more meetings
  const loadMore = () => {
    if (hasNextPage && !loading) {
      loadMeetings(currentPage + 1, true);
    }
  };

  // Create meeting
  const handleCreateMeeting = async () => {
    if (!newMeeting.title || !newMeeting.startTime || !newMeeting.endTime) {
      showError("Title, start time, and end time are required", "Error");
      return;
    }

    try {
      setCreating(true);
      await meetingService.createMeeting(newMeeting);
      
      // Reset form
      setNewMeeting({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        participants: []
      });
      
      setShowCreateDialog(false);
      showSuccess("Meeting created successfully", "Success");
      
      // Reload meetings
      loadMeetings(1, false);
    } catch (error) {
      console.error('Error creating meeting:', error);
      showError("Failed to create meeting", "Error");
    } finally {
      setCreating(false);
    }
  };

  // Edit meeting
  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setEditMeeting({
      title: meeting.title,
      description: meeting.description || '',
      startTime: meeting.startTime ? new Date(meeting.startTime).toISOString().slice(0, 16) : '',
      endTime: meeting.endTime ? new Date(meeting.endTime).toISOString().slice(0, 16) : ''
    });
    setShowEditDialog(true);
  };

  // Update meeting
  const handleUpdateMeeting = async () => {
    if (!editingMeeting || !editMeeting.title || !editMeeting.startTime || !editMeeting.endTime) {
      showError("Title, start time, and end time are required", "Error");
      return;
    }

    try {
      setUpdating(true);
      await meetingService.updateMeeting(editingMeeting.id, editMeeting);
       
      showSuccess("Meeting updated successfully", "Success");
      setShowEditDialog(false);
      setEditingMeeting(null);
      
      // Reload meetings
      loadMeetings(1, false);
    } catch (error) {
      console.error('Error updating meeting:', error);
      showError("Failed to update meeting", "Error");
    } finally {
      setUpdating(false);
    }
  };

  // Send invites
  const handleSendInvites = (meeting: Meeting) => {
    setInvitingMeeting(meeting);
    setNewParticipants([]);
    setShowInviteDialog(true);
  };

  // Invite participants
  const handleInviteParticipants = async () => {
    if (!invitingMeeting || newParticipants.length === 0) {
      showError("Please add at least one participant", "Error");
      return;
    }

    try {
      setInviting(true);
      await meetingService.inviteParticipants(invitingMeeting.id, { participants: newParticipants });
      
      showSuccess("Invitations sent successfully", "Success");
      setShowInviteDialog(false);
      
      // Reload meetings to show updated participant list
      loadMeetings(1, false);
    } catch (error) {
      console.error('Error inviting participants:', error);
      showError("Failed to send invitations", "Error");
    } finally {
      setInviting(false);
    }
  };

  // Accept meeting invitation
  const handleAcceptInvitation = async (meetingId: string, participantId: string) => {
    try {
      await meetingService.updateParticipantStatus(meetingId, participantId, 'accepted');
      showSuccess("Meeting invitation accepted", "Success");
      loadMeetings(1, false);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      showError("Failed to accept invitation", "Error");
    }
  };

  // Decline meeting invitation
  const handleDeclineInvitation = async (meetingId: string, participantId: string) => {
    try {
      await meetingService.updateParticipantStatus(meetingId, participantId, 'declined');
      showSuccess("Meeting invitation declined", "Success");
      loadMeetings(1, false);
    } catch (error) {
      console.error('Error declining invitation:', error);
      showError("Failed to decline invitation", "Error");
    }
  };

  // Add participant to invite list
  const addParticipant = () => {
    setNewParticipants(prev => [...prev, { email: '' }]);
  };

  // Remove participant from invite list
  const removeParticipant = (index: number) => {
    setNewParticipants(prev => prev.filter((_, i) => i !== index));
  };

  // Update participant in invite list
  const updateParticipant = (index: number, field: 'email', value: string) => {
    setNewParticipants(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  // Delete meeting
  const handleDeleteMeeting = async (meetingId: string) => {
    setMeetingToDelete(meetingId);
    setShowDeleteDialog(true);
  };

  // Confirm delete meeting
  const confirmDeleteMeeting = async () => {
    if (!meetingToDelete) return;

    try {
      await meetingService.deleteMeeting(meetingToDelete);
      setMeetings(prev => prev.filter(meeting => meeting.id !== meetingToDelete));
      showSuccess("Meeting deleted successfully", "Success");
    } catch (error) {
      console.error('Error deleting meeting:', error);
      showError("Failed to delete meeting", "Error");
    } finally {
      setShowDeleteDialog(false);
      setMeetingToDelete(null);
    }
  };

  // Toggle meeting details
  const toggleMeetingDetails = (meetingId: string) => {
    setExpandedMeetings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(meetingId)) {
        newSet.delete(meetingId);
      } else {
        newSet.add(meetingId);
      }
      return newSet;
    });
  };

  // Copy meeting invite link
  const copyMeetingLink = async (meetingLink: string) => {
    try {
      if (!meetingLink) {
        showError("Meeting link not available", "Error");
        return;
      }
      
      await navigator.clipboard.writeText(meetingLink);
      showSuccess("Meeting link copied to clipboard", "Success");
    } catch (error) {
      console.error('Error copying meeting link:', error);
      showError("Failed to copy meeting link", "Error");
    }
  };

  // Get meeting status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>;
      case 'in_progress':
        return <Badge variant="default">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get meeting status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-600';
      case 'in_progress':
        return 'text-green-600';
      case 'completed':
        return 'text-gray-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Format date safely
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  useEffect(() => {
    loadMeetings();
    // Load invitations for current user
    (async () => {
      try {
        setLoadingInvites(true);
        const res = await meetingService.getMyInvitations();
        const pending = (res.data || []).filter(p => p.status === 'invited');
        setInvitations(pending);
      } catch (e) {
        console.error('Error loading invitations:', e);
      } finally {
        setLoadingInvites(false);
      }
    })();
  }, []);

  // Build calendar events with color coding based on current user's invite status
  useEffect(() => {
    if (!user) return;
    const events = meetings.map((m) => {
      const me = m.participants?.find(p => p.userId === user.id || p.email === user.email);
      let backgroundColor = '#facc15'; // pending yellow
      if (me?.status === 'accepted') backgroundColor = '#22c55e'; // green
      if (me?.status === 'declined') backgroundColor = '#9ca3af'; // gray
      return {
        id: m.id,
        title: m.title,
        start: m.startTime,
        end: m.endTime,
        backgroundColor,
        borderColor: backgroundColor,
      };
    });
    setCalendarEvents(events);
  }, [meetings, user]);

  // Real-time updates: refresh meetings and invites when meeting events occur
  useEffect(() => {
    const token = tokenManager.get();
    if (token && !socketService.isConnected()) {
      try { socketService.connect(token); } catch {}
    }
    const refresh = () => {
      loadMeetings(1, false);
      meetingService.getMyInvitations()
        .then(res => setInvitations((res.data || []).filter(p => p.status === 'invited')))
        .catch(() => {});
    };
    socketService.on?.('meeting:created', refresh);
    socketService.on?.('meeting:updated', refresh);
    socketService.on?.('meeting:deleted', refresh);
    socketService.on?.('meeting:participantStatus', refresh);
    return () => {
      socketService.off?.('meeting:created', refresh);
      socketService.off?.('meeting:updated', refresh);
      socketService.off?.('meeting:deleted', refresh);
      socketService.off?.('meeting:participantStatus', refresh);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <NavigationHeader title="Meetings" />
      {/* Invitations Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Invitations</h2>
        {loadingInvites ? (
          <div className="text-sm text-gray-500">Loading invitations...</div>
        ) : invitations.length === 0 ? (
          <div className="text-sm text-gray-500">No pending invitations.</div>
        ) : (
          <div className="space-y-3">
            {invitations.map((inv) => (
              <Card key={inv.id} className="border-blue-100">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{inv.meeting.title}</h3>
                        {getStatusBadge(inv.meeting.status)}
                      </div>
                      {inv.meeting.description && (
                        <p className="text-sm text-gray-600 mt-1">{inv.meeting.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(inv.meeting.startTime).toLocaleString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{inv.meeting.participants?.length || 0} participants</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          await handleAcceptInvitation(inv.meetingId, inv.id);
                          const res = await meetingService.getMyInvitations();
                          setInvitations((res.data || []).filter(p => p.status === 'invited'));
                        }}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await handleDeclineInvitation(inv.meetingId, inv.id);
                          const res = await meetingService.getMyInvitations();
                          setInvitations((res.data || []).filter(p => p.status === 'invited'));
                        }}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600 mt-2">Schedule and manage your meetings</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="h-8 px-3"
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              Calendar
            </Button>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Another Meeting
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Meeting</DialogTitle>
              <DialogDescription>
                Schedule a new meeting or interview with candidates
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Title *
                </label>
                <Input
                  placeholder="Enter meeting title"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  placeholder="Enter meeting description"
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <Input
                    type="datetime-local"
                    value={newMeeting.startTime}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <Input
                    type="datetime-local"
                    value={newMeeting.endTime}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateMeeting} disabled={creating}>
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Create Meeting
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Meetings View */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {loading && meetings.length === 0 ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading meetings...</p>
            </div>
          ) : meetings.length > 0 ? (
          meetings.map((meeting) => (
            <Card key={meeting.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                      {getStatusBadge(meeting.status)}
                    </div>
                    
                    {meeting.description && (
                      <p className="text-gray-600 mb-3">{meeting.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(meeting.startTime).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {new Date(meeting.startTime).toLocaleTimeString()} - {new Date(meeting.endTime).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{meeting.participants.length} participants</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <span>Created {formatDate(meeting.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMeetingDetails(meeting.id)}
                    >
                      {expandedMeetings.has(meeting.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    
                    {meeting.recruiterId === user?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleSendInvites(meeting)}>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Invites
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditMeeting(meeting)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Meeting
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Video className="h-4 w-4 mr-2" />
                          Start Meeting
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteMeeting(meeting.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Meeting
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    )}
                  </div>
                </div>
                
                {/* Expanded Details */}
                {expandedMeetings.has(meeting.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Participants</h4>
                    <div className="space-y-2">
                      {meeting.participants.map((participant) => (
                        <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={participant.user?.profilePicture} />
                              <AvatarFallback className="text-sm">
                                {participant.user ? 
                                  participant.user.name[0].toUpperCase() : 
                                  participant.email?.[0].toUpperCase() || '?'
                                }
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {participant.user ? 
                                  participant.user.name : 
                                  participant.email
                                }
                              </p>
                              <p className="text-xs text-gray-500 capitalize">{participant.role}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {participant.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (meeting.meetingLink) {
                            window.open(meeting.meetingLink, '_blank');
                          } else {
                            showError("Meeting link not available", "Error");
                          }
                        }}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Join Meeting
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => copyMeetingLink(meeting.meetingLink)}>
                        <Mail className="h-4 w-4 mr-2" />Copy Link
                      </Button>
                      {/* Invitee controls if pending */}
                      {(() => {
                        const me = meeting.participants.find(p => p.userId === user?.id || p.email === user?.email);
                        if (me && me.status === 'invited') {
                          return (
                            <>
                              <Button size="sm" onClick={() => handleAcceptInvitation(meeting.id, me.id)}>Accept</Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeclineInvitation(meeting.id, me.id)}>Decline</Button>
                            </>
                          );
                        }
                        return null;
                      })()}
                      {/* Organizer-only controls */}
                      {meeting.recruiterId === user?.id && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleSendInvites(meeting)}>Invite</Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditMeeting(meeting)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteMeeting(meeting.id)}>Delete</Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings scheduled</h3>
            <p className="text-gray-500 mb-4">Create your first meeting to get started</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Meeting
            </Button>
          </div>
        )}
        
        {/* Load More Button */}
        {hasNextPage && (
          <div className="text-center">
            <Button
              onClick={loadMore}
              disabled={loading}
              variant="outline"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Load More
            </Button>
          </div>
        )}
      </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-2">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ start: 'prev', center: 'title', end: 'next' }}
            events={calendarEvents}
            height="auto"
            dayMaxEvents={3}
            dateClick={(info) => {
              const startOfDay = new Date(info.dateStr);
              const endOfDay = new Date(startOfDay);
              endOfDay.setDate(endOfDay.getDate() + 1);
              const items = meetings.filter(m => new Date(m.startTime) >= startOfDay && new Date(m.startTime) < endOfDay);
              setDayMeetings(items);
              setShowDayModal(true);
            }}
            eventClick={(info) => {
              const m = meetings.find(x => x.id === info.event.id);
              if (m) {
                setActiveMeeting(m);
                setShowEventModal(true);
              }
            }}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this meeting? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setMeetingToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteMeeting}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Day Meetings Modal */}
      <Dialog open={showDayModal} onOpenChange={setShowDayModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Meetings for Selected Day</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {dayMeetings.length === 0 ? (
              <div className="text-sm text-gray-500">No meetings on this day.</div>
            ) : (
              dayMeetings.map((m) => (
                <Card key={m.id} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{m.title}</h3>
                          {getStatusBadge(m.status)}
                        </div>
                        {m.description && (
                          <p className="text-sm text-gray-600 mt-1">{m.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(m.startTime).toLocaleString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{m.participants?.length || 0} participants</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => { setActiveMeeting(m); setShowEventModal(true); }}>Details</Button>
                        <Button size="sm" onClick={() => window.open(`/meeting/${m.id}`, '_blank')}><Video className="h-4 w-4 mr-1"/>Join</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Detail Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="sm:max-w-[620px]">
          <DialogHeader>
            <DialogTitle>{activeMeeting?.title || 'Meeting Details'}</DialogTitle>
            <DialogDescription>
              {activeMeeting ? `${new Date(activeMeeting.startTime).toLocaleString()} - ${new Date(activeMeeting.endTime).toLocaleString()}` : ''}
            </DialogDescription>
          </DialogHeader>
          {activeMeeting && (
            <div className="space-y-4">
              {activeMeeting.description && (
                <p className="text-sm text-gray-700">{activeMeeting.description}</p>
              )}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Participants</h4>
                <div className="space-y-2">
                  {activeMeeting.participants.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={p.user?.profilePicture} />
                          <AvatarFallback className="text-sm">{p.user ? p.user.name[0]?.toUpperCase() : (p.email?.[0]?.toUpperCase() || '?')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{p.user ? p.user.name : p.email}</p>
                          <p className="text-xs text-gray-500 capitalize">{p.role}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">{p.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (activeMeeting.meetingLink) window.open(activeMeeting.meetingLink, '_blank');
                    else showError('Meeting link not available', 'Error');
                  }}
                >
                  <Video className="h-4 w-4 mr-2"/>Join
                </Button>
                <Button variant="outline" size="sm" onClick={() => copyMeetingLink(activeMeeting.meetingLink)}>
                  <Mail className="h-4 w-4 mr-2"/>Copy Link
                </Button>
                {/* Invitee actions */}
                {(() => {
                  const me = activeMeeting.participants.find(p => p.userId === user?.id || p.email === user?.email);
                  if (me && me.status === 'invited') {
                    return (
                      <>
                        <Button size="sm" onClick={() => handleAcceptInvitation(activeMeeting.id, me.id)}>Accept</Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeclineInvitation(activeMeeting.id, me.id)}>Decline</Button>
                      </>
                    );
                  }
                  return null;
                })()}
                {/* Organizer actions */}
                {activeMeeting.recruiterId === user?.id && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => { setShowEventModal(false); handleSendInvites(activeMeeting); }}>Invite</Button>
                    <Button size="sm" variant="outline" onClick={() => { setShowEventModal(false); handleEditMeeting(activeMeeting); }}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => { setShowEventModal(false); handleDeleteMeeting(activeMeeting.id); }}>Delete</Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Edit Meeting Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Meeting</DialogTitle>
            <DialogDescription>
              Update meeting details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Title *
              </label>
              <Input
                placeholder="Enter meeting title"
                value={editMeeting.title}
                onChange={(e) => setEditMeeting(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                placeholder="Enter meeting description"
                value={editMeeting.description}
                onChange={(e) => setEditMeeting(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <Input
                  type="datetime-local"
                  value={editMeeting.startTime}
                  onChange={(e) => setEditMeeting(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time *
                </label>
                <Input
                  type="datetime-local"
                  value={editMeeting.endTime}
                  onChange={(e) => setEditMeeting(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMeeting} disabled={updating}>
              {updating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Edit className="h-4 w-4 mr-2" />
              )}
              Update Meeting
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Invites Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Meeting Invites</DialogTitle>
            <DialogDescription>
              Invite participants to {invitingMeeting?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Participants
              </label>
              <div className="space-y-2">
                {newParticipants.map((participant, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder="Enter email address"
                      value={participant.email || ''}
                      onChange={(e) => updateParticipant(index, 'email', e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeParticipant(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addParticipant}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Participant
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteParticipants} disabled={inviting}>
              {inviting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Send Invites
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
