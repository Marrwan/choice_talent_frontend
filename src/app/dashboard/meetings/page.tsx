'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/store';
import { meetingService, Meeting, CreateMeetingData, UpdateMeetingData } from '@/services/meetingService';
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
  ChevronUp
} from 'lucide-react';
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
      setInvitingMeeting(null);
      setNewParticipants([]);
      
      // Reload meetings
      loadMeetings(1, false);
    } catch (error) {
      console.error('Error sending invitations:', error);
      showError("Failed to send invitations", "Error");
    } finally {
      setInviting(false);
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
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600 mt-2">Schedule and manage your meetings</p>
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

      {/* Meetings List */}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyMeetingLink(meeting.meetingLink)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
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
