'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { meetingService } from '@/services/meetingService';
import { useWebRTC } from '@/hooks/useWebRTC';
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
  Loader2,
  Monitor,
  MonitorOff,
  ArrowLeft
} from 'lucide-react';

export default function MeetingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { showError, showSuccess } = useToast();
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  
  // Store toast functions in refs to avoid dependency issues
  const showErrorRef = useRef(showError);
  const showSuccessRef = useRef(showSuccess);
  
  // Update refs when toast functions change
  useEffect(() => {
    showErrorRef.current = showError;
    showSuccessRef.current = showSuccess;
  }, [showError, showSuccess]);
  
  // WebRTC hooks - only initialize if authenticated
  const {
    callState,
    localStream,
    remoteStreams,
    participants,
    remoteParticipants,
    isMuted,
    isVideoOn,
    isScreenSharing,
    callDuration,
    error,
    initializeCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    isInCall,
    isActive
  } = useWebRTC();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const meetingId = (params?.id as string) || '';

  // Load meeting details - memoized with useCallback
  const loadMeeting = useCallback(async () => {
    try {
      setLoading(true);
      // Try authenticated first if available; otherwise fall back to public
      let response;
      if (isAuthenticated && user) {
        response = await meetingService.getMeeting(meetingId);
      } else {
        response = await meetingService.getMeetingPublic(meetingId);
      }
      setMeeting(response.data);
    } catch (error: any) {
      console.error('Error loading meeting:', error);
      if (error?.status === 404) {
        showErrorRef.current("Meeting not found", "Error");
      } else {
        showErrorRef.current("Failed to load meeting details", "Error");
      }
    } finally {
      setLoading(false);
    }
  }, [meetingId, isAuthenticated, user]);

  // For viewing, login is not forced. Users can join as guests.

  // Join meeting
  const handleJoinMeeting = async () => {
    try {
      // Initialize WebRTC call
      const success = await initializeCall('video');
      if (!success) {
        showErrorRef.current("Failed to initialize video call", "Error");
        return;
      }

      setIsJoined(true);
      showSuccessRef.current("Joined meeting successfully", "Success");
      
      // In a real implementation, you would connect to the meeting room via WebSocket
      console.log('Joined meeting:', meetingId);
    } catch (error) {
      console.error('Error joining meeting:', error);
      showErrorRef.current("Failed to join meeting", "Error");
    }
  };

  // Leave meeting
  const handleLeaveMeeting = async () => {
    try {
      await endCall();
      setIsJoined(false);
      showSuccessRef.current("Left meeting", "Success");
    } catch (error) {
      console.error('Error leaving meeting:', error);
      showErrorRef.current("Failed to leave meeting", "Error");
    }
  };

  // Handle local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Handle remote video streams
  useEffect(() => {
    if (remoteVideoRef.current && remoteStreams.size > 0) {
      // For simplicity, show the first remote stream
      const firstRemoteStream = Array.from(remoteStreams.values())[0];
      remoteVideoRef.current.srcObject = firstRemoteStream;
    }
  }, [remoteStreams]);

  // Handle WebRTC errors
  useEffect(() => {
    if (error) {
      showErrorRef.current(error.message, "WebRTC Error");
    }
  }, [error]);

  useEffect(() => {
    if (meetingId) {
      loadMeeting();
    }
  }, [meetingId, loadMeeting]);

  // Show loading while checking authentication
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

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
          <p className="text-gray-600 mb-4">The meeting you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
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
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-white font-semibold">{meeting.title}</h1>
            <Badge variant="secondary">
              {meeting.status === 'scheduled' ? 'Scheduled' : 
               meeting.status === 'in_progress' ? 'In Progress' : 
               meeting.status === 'completed' ? 'Completed' : 'Cancelled'}
            </Badge>
            {isActive && (
              <Badge variant="default">
                {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-white">
              <Users className="h-4 w-4 mr-2" />
              {participants.length} Participants
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
            <Card className="w-full max-w-md bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-center text-white">Join Meeting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 bg-gray-800">
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2 text-white">{meeting.title}</h3>
                  <p className="text-gray-300 text-sm mb-4">{meeting.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-400">
                    <div>Start Time: {new Date(meeting.startTime).toLocaleString()}</div>
                    <div>End Time: {new Date(meeting.endTime).toLocaleString()}</div>
                    <div>Participants: {meeting.participants?.length || 0}</div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleJoinMeeting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Video Area */}
            <div className="lg:col-span-3">
              <div className="bg-gray-800 rounded-lg p-4 min-h-[500px] relative">
                {/* Remote Video */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover rounded"
                />
                
                {/* Local Video (Picture-in-Picture) */}
                {localStream && (
                  <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* No Video Placeholder */}
                {!remoteStreams.size && !localStream && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-white">
                      <Video className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-semibold mb-2">Video Call Interface</p>
                      <p className="text-gray-400">
                        Waiting for participants to join...
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4 mt-4">
                <Button
                  variant={isVideoOn ? "default" : "secondary"}
                  size="lg"
                  onClick={toggleVideo}
                >
                  {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>
                
                <Button
                  variant={!isMuted ? "default" : "secondary"}
                  size="lg"
                  onClick={toggleMute}
                >
                  {!isMuted ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>
                
                <Button
                  variant={isScreenSharing ? "default" : "outline"}
                  size="lg"
                  onClick={toggleScreenShare}
                >
                  {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowChat(!showChat)}
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleLeaveMeeting}
                >
                  <Phone className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Participants List */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Participants</CardTitle>
                </CardHeader>
                <CardContent className="bg-gray-800">
                  <div className="space-y-2">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">
                              {participant.name[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="text-white text-sm">{participant.name}</span>
                        </div>
                        <div className="flex space-x-1">
                          {participant.isMuted && <MicOff className="h-3 w-3 text-red-400" />}
                          {!participant.isCameraOn && <VideoOff className="h-3 w-3 text-red-400" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Chat */}
              {showChat && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Chat</CardTitle>
                  </CardHeader>
                  <CardContent className="bg-gray-800">
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {chatMessages.map((message, index) => (
                        <div key={index} className="p-2 bg-gray-700 rounded">
                          <p className="text-white text-sm">
                            <span className="font-medium">{message.sender}:</span> {message.text}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex space-x-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-2 py-1 bg-gray-700 text-white rounded text-sm border-gray-600 placeholder-gray-400"
                      />
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Send</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
