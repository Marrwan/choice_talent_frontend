'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/store';
import { meetingService, Meeting, CreateMeetingData } from '@/services/meetingService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/lib/useToast';
import { 
  Calendar,
  Clock,
  Users,
  Plus,
  Edit,
  Trash2,
  Video,
  Mail,
  Loader2,
  MoreHorizontal,
  Copy
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
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
  
  // Edit meeting states
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [editMeeting, setEditMeeting] = useState<CreateMeetingData>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    participants: []
  });
  const [updating, setUpdating] = useState(false);
  
  // Send invites states
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [invitingMeeting, setInvitingMeeting] = useState<Meeting | null>(null);
  const [newParticipants, setNewParticipants] = useState<string[]>(['']);
  const [sendingInvites, setSendingInvites] = useState(false);
  
  const [newMeeting, setNewMeeting] = useState<CreateMeetingData>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    participants: []
  });

  // Load meetings
  const loadMeetings = async () => {
    try {
      setLoading(true);
      const response = await meetingService.getMeetings();
      setMeetings(response.meetings);
    } catch (error: any) {
      console.error('Error loading meetings:', error);
      
      // Handle specific error types
      if (error?.status === 401) {
        showError("Please log in to view meetings", "Authentication Error");
      } else if (error?.status === 403) {
        showError("You don't have permission to view meetings", "Permission Error");
      } else if (error?.status >= 500) {
        showError("Server error. Please try again later.", "Server Error");
      } else {
        showError(error?.message || "Failed to load meetings", "Error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Create meeting
  const handleCreateMeeting = async () => {
    if (!newMeeting.title.trim() || !newMeeting.startTime || !newMeeting.endTime) {
      showError("Please fill in all required fields", "Error");
      return;
    }

    // Client-side validation
    const startTime = new Date(newMeeting.startTime);
    const endTime = new Date(newMeeting.endTime);
    const now = new Date();

    if (startTime <= now) {
      showError("Start time must be in the future", "Validation Error");
      return;
    }

    if (endTime <= startTime) {
      showError("End time must be after start time", "Validation Error");
      return;
    }

    try {
      setCreating(true);
      const response = await meetingService.createMeeting(newMeeting);
      
      // Add new meeting to the list
      setMeetings(prev => [response.data, ...prev]);
      
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
    } catch (error: any) {
      console.error('Error creating meeting:', error);
      
      // Handle specific validation errors
      if (error?.status === 400) {
        showError(error.message || "Invalid meeting data", "Validation Error");
      } else if (error?.status >= 500) {
        showError("Server error. Please try again later.", "Server Error");
      } else {
        showError(error?.message || "Failed to create meeting", "Error");
      }
    } finally {
      setCreating(false);
    }
  };

  // Delete meeting with toast confirmation
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

  // Join meeting
  const handleJoinMeeting = async (meeting: Meeting) => {
    try {
      if (!meeting.meetingLink) {
        showError("Meeting link not available", "Error");
        return;
      }
      
      const response = await meetingService.generateMeetingToken(meeting.id);
      // In a real implementation, this would open the meeting room
      window.open(meeting.meetingLink, '_blank');
    } catch (error) {
      console.error('Error joining meeting:', error);
      showError("Failed to join meeting", "Error");
    }
  };

  // Copy meeting link
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

  // Send invites
  const handleSendInvites = (meeting: Meeting) => {
    setInvitingMeeting(meeting);
    setNewParticipants(['']);
    setShowInviteDialog(true);
  };

  // Handle invite participants
  const handleInviteParticipants = async () => {
    if (!invitingMeeting) return;
    
    const validEmails = newParticipants.filter(email => email.trim() && email.includes('@'));
    if (validEmails.length === 0) {
      showError("Please add at least one valid email address", "Error");
      return;
    }

    try {
      setSendingInvites(true);
      await meetingService.inviteParticipants(invitingMeeting.id, {
        participants: validEmails.map(email => ({ email }))
      });
      showSuccess("Invitations sent successfully", "Success");
      setShowInviteDialog(false);
      setInvitingMeeting(null);
      setNewParticipants(['']);
    } catch (error: any) {
      console.error('Error sending invitations:', error);
      showError(error?.message || "Failed to send invitations", "Error");
    } finally {
      setSendingInvites(false);
    }
  };

  // Add participant email field
  const addParticipantField = () => {
    setNewParticipants([...newParticipants, '']);
  };

  // Remove participant email field
  const removeParticipantField = (index: number) => {
    if (newParticipants.length > 1) {
      setNewParticipants(newParticipants.filter((_, i) => i !== index));
    }
  };

  // Update participant email
  const updateParticipantEmail = (index: number, email: string) => {
    const updated = [...newParticipants];
    updated[index] = email;
    setNewParticipants(updated);
  };

  // Edit meeting
  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setEditMeeting({
      title: meeting.title,
      description: meeting.description || '',
      startTime: new Date(meeting.startTime).toISOString().slice(0, 16),
      endTime: new Date(meeting.endTime).toISOString().slice(0, 16),
      participants: []
    });
    setShowEditDialog(true);
  };

  // Handle update meeting
  const handleUpdateMeeting = async () => {
    if (!editingMeeting) return;
    
    if (!editMeeting.title.trim() || !editMeeting.startTime || !editMeeting.endTime) {
      showError("Please fill in all required fields", "Error");
      return;
    }

    // Client-side validation
    const startTime = new Date(editMeeting.startTime);
    const endTime = new Date(editMeeting.endTime);

    if (endTime <= startTime) {
      showError("End time must be after start time", "Validation Error");
      return;
    }

    try {
      setUpdating(true);
      await meetingService.updateMeeting(editingMeeting.id, editMeeting);
      
      // Update meeting in the list
      setMeetings(prev => prev.map(meeting => 
        meeting.id === editingMeeting.id 
          ? { 
              ...meeting, 
              title: editMeeting.title,
              description: editMeeting.description,
              startTime: editMeeting.startTime,
              endTime: editMeeting.endTime
            }
          : meeting
      ));
      
      showSuccess("Meeting updated successfully", "Success");
      setShowEditDialog(false);
      setEditingMeeting(null);
    } catch (error: any) {
      console.error('Error updating meeting:', error);
      showError(error?.message || "Failed to update meeting", "Error");
    } finally {
      setUpdating(false);
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
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Get meeting date display
  const getMeetingDate = (date: string) => {
    try {
      const meetingDate = new Date(date);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (meetingDate.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (meetingDate.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      } else {
        return meetingDate.toLocaleDateString();
      }
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get meeting time display
  const getMeetingTime = (startTime: string, endTime: string) => {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      return `${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    } catch (error) {
      return 'Invalid Time';
    }
  };

  // Get created date display
  const getCreatedDate = (date: string) => {
    try {
      const createdDate = new Date(date);
      return createdDate.toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
            <p className="text-gray-600 mt-2">Schedule and manage your meetings</p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Schedule New Meeting</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    placeholder="Meeting title"
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Meeting description"
                    value={newMeeting.description}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Time *</label>
                    <Input
                      type="datetime-local"
                      value={newMeeting.startTime}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">End Time *</label>
                    <Input
                      type="datetime-local"
                      value={newMeeting.endTime}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateMeeting}
                    disabled={creating}
                  >
                    {creating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Create Meeting'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Meetings List */}
        <div className="space-y-4">
          {meetings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings scheduled</h3>
                <p className="text-gray-600 text-center mb-4">
                  Get started by scheduling your first meeting with candidates or team members.
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {meetings.map((meeting) => (
                <Card key={meeting.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {meeting.title}
                          </h3>
                          {getStatusBadge(meeting.status)}
                        </div>
                        
                        {meeting.description && (
                          <p className="text-gray-600 mb-3">{meeting.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{getMeetingDate(meeting.startTime)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{getMeetingTime(meeting.startTime, meeting.endTime)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{meeting.participants.length} participants</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-xs text-gray-500">
                            Created {getCreatedDate(meeting.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {meeting.status === 'scheduled' && (
                          <Button
                            size="sm"
                            onClick={() => handleJoinMeeting(meeting)}
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Join
                          </Button>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleJoinMeeting(meeting)}>
                              <Video className="h-4 w-4 mr-2" />
                              Join Meeting
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyMeetingLink(meeting.meetingLink)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendInvites(meeting)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Invites
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditMeeting(meeting)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteMeeting(meeting.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    {/* Participants */}
                    {meeting.participants.length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Participants</h4>
                          <div className="flex flex-wrap gap-2">
                            {meeting.participants.map((participant) => (
                              <Badge key={participant.id} variant="outline">
                                {participant.user ? 
                                  participant.user.name : 
                                  participant.email
                                }
                                <span className="ml-1 text-xs">
                                  ({participant.status})
                                </span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {/* Additional Schedule Meeting Button */}
              <div className="text-center pt-4">
                <Button onClick={() => setShowCreateDialog(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Another Meeting
                </Button>
              </div>
            </>
          )}
        </div>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <Input
                value={editMeeting.title}
                onChange={(e) => setEditMeeting({ ...editMeeting, title: e.target.value })}
                placeholder="Meeting title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                value={editMeeting.description}
                onChange={(e) => setEditMeeting({ ...editMeeting, description: e.target.value })}
                placeholder="Meeting description"
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
                  onChange={(e) => setEditMeeting({ ...editMeeting, startTime: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time *
                </label>
                <Input
                  type="datetime-local"
                  value={editMeeting.endTime}
                  onChange={(e) => setEditMeeting({ ...editMeeting, endTime: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingMeeting(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateMeeting}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Meeting'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Invites Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Meeting Invites</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Add email addresses of participants you want to invite to this meeting.
            </p>
            
            <div className="space-y-3">
              {newParticipants.map((email, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => updateParticipantEmail(index, e.target.value)}
                    placeholder="participant@example.com"
                    className="flex-1"
                  />
                  {newParticipants.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeParticipantField(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={addParticipantField}
              >
                Add Another Email
              </Button>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowInviteDialog(false);
                  setInvitingMeeting(null);
                  setNewParticipants(['']);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInviteParticipants}
                disabled={sendingInvites}
              >
                {sendingInvites ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Invites'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
