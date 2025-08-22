'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { meetingService } from '@/services/meetingService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/lib/useToast';
import { 
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  Users,
  MessageSquare,
  Share,
  Settings,
  Loader2
} from 'lucide-react';

export default function MeetingRoomPage() {
  const params = useParams();
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isJoined, setIsJoined] = useState(false);

  const meetingId = (params?.id as string) || '';

  // Load meeting details
  const loadMeeting = async () => {
    try {
      setLoading(true);
      const response = await meetingService.getMeeting(meetingId);
      setMeeting(response.data);
    } catch (error) {
      console.error('Error loading meeting:', error);
      showError("Failed to load meeting details", "Error");
    } finally {
      setLoading(false);
    }
  };

  // Join meeting
  const handleJoinMeeting = async () => {
    try {
      const response = await meetingService.generateMeetingToken(meetingId);
      setIsJoined(true);
      showSuccess("Joined meeting successfully", "Success");
      
      // In a real implementation, this would initialize WebRTC
      console.log('Meeting token:', response.data.token);
    } catch (error) {
      console.error('Error joining meeting:', error);
      showError("Failed to join meeting", "Error");
    }
  };

  // Leave meeting
  const handleLeaveMeeting = () => {
    setIsJoined(false);
    showSuccess("Left meeting", "Success");
  };

  useEffect(() => {
    if (meetingId) {
      loadMeeting();
    }
  }, [meetingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Meeting Not Found</h1>
          <p className="text-gray-600">The meeting you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-white font-semibold">{meeting.title}</h1>
            <Badge variant="secondary">
              {meeting.status === 'scheduled' ? 'Scheduled' : 
               meeting.status === 'in_progress' ? 'In Progress' : 
               meeting.status === 'completed' ? 'Completed' : 'Cancelled'}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-white">
              <Users className="h-4 w-4 mr-2" />
              {meeting.participants.length} Participants
            </Button>
            <Button variant="ghost" size="sm" className="text-white">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {!isJoined ? (
          // Pre-join screen
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-center">Join Meeting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">{meeting.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{meeting.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div>Start Time: {new Date(meeting.startTime).toLocaleString()}</div>
                    <div>End Time: {new Date(meeting.endTime).toLocaleString()}</div>
                    <div>Participants: {meeting.participants.length}</div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleJoinMeeting}
                  className="w-full"
                  size="lg"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Join Meeting
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Meeting room
          <div className="space-y-4">
            {/* Video Area */}
            <div className="bg-gray-800 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
              <div className="text-center text-white">
                <Video className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-semibold mb-2">Video Call Interface</p>
                <p className="text-gray-400">
                  This is a placeholder for the actual video call interface.
                  In a real implementation, this would show video streams from participants.
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant={videoEnabled ? "default" : "secondary"}
                size="lg"
                onClick={() => setVideoEnabled(!videoEnabled)}
              >
                {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
              
              <Button
                variant={audioEnabled ? "default" : "secondary"}
                size="lg"
                onClick={() => setAudioEnabled(!audioEnabled)}
              >
                {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
              
              <Button variant="outline" size="lg">
                <MessageSquare className="h-5 w-5" />
              </Button>
              
              <Button variant="outline" size="lg">
                <Share className="h-5 w-5" />
              </Button>
              
              <Button
                variant="destructive"
                size="lg"
                onClick={handleLeaveMeeting}
              >
                <Phone className="h-5 w-5" />
              </Button>
            </div>

            {/* Participants List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {meeting.participants.map((participant: any) => (
                    <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">
                            {participant.user ? 
                              `${participant.user.firstName[0]}${participant.user.lastName[0]}` : 
                              participant.email[0].toUpperCase()
                            }
                          </span>
                        </div>
                        <span className="text-white">
                          {participant.user ? 
                            `${participant.user.firstName} ${participant.user.lastName}` : 
                            participant.email
                          }
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {participant.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
