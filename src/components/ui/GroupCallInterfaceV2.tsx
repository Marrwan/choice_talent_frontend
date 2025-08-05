import React, { useEffect, useRef, useState } from 'react';
import { useWebRTC, CallParticipant } from '@/hooks/useWebRTC';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Users, ScreenShare, ScreenShareOff } from 'lucide-react';

export interface GroupCallInterfaceV2Props {
  callId: string;
  groupId: string;
  groupName: string;
  groupAvatar?: string;
  initialParticipants?: CallParticipant[];
  onCallEnd?: () => void;
  className?: string;
}

export function GroupCallInterfaceV2({
  callId,
  groupId,
  groupName,
  groupAvatar,
  initialParticipants = [],
  onCallEnd,
  className,
}: GroupCallInterfaceV2Props) {
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
    startCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
  } = useWebRTC();

  const [gridColumns, setGridColumns] = useState('grid-cols-1');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const remoteAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Initialize call
  useEffect(() => {
    const initializeGroupCall = async () => {
      try {
        console.log('Starting group call with ID:', callId);
        await startCall(callId, 'video'); // Default to video for group calls
      } catch (err) {
        console.error('Error initializing group call:', err);
        onCallEnd?.();
      }
    };

    if (callState === 'idle') {
      initializeGroupCall();
    }

    return () => {
      if (callState !== 'idle' && callState !== 'ended') {
        console.log('Ending call with ID:', callId);
        endCall().catch(console.error);
      }
    };
  }, [callId, callState, endCall, onCallEnd, startCall]);

  // Handle local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Handle remote video streams
  useEffect(() => {
    remoteStreams.forEach((stream, participantId) => {
      const videoElement = remoteVideoRefs.current.get(participantId);
      if (videoElement) {
        videoElement.srcObject = stream;
      }
    });
  }, [remoteStreams]);

  // Handle remote audio streams
  useEffect(() => {
    remoteStreams.forEach((stream, participantId) => {
      let audioElement = remoteAudioRefs.current.get(participantId);
      
      if (!audioElement) {
        audioElement = new Audio();
        audioElement.autoplay = true;
        audioElement.volume = 1.0;
        remoteAudioRefs.current.set(participantId, audioElement);
      }
      
      if (audioElement.srcObject !== stream) {
        audioElement.srcObject = stream;
        audioElement.play().catch(console.error);
      }
    });
  }, [remoteStreams]);

  // Update grid columns based on number of participants
  useEffect(() => {
    const participantCount = participants.length + 1; // +1 for local participant
    
    let columns = 'grid-cols-1';
    if (participantCount > 4) {
      columns = 'grid-cols-3';
    } else if (participantCount > 1) {
      columns = 'grid-cols-2';
    }
    
    setGridColumns(columns);
  }, [participants.length]);

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle call end
  const handleEndCall = async () => {
    try {
      await endCall();
      onCallEnd?.();
    } catch (err) {
      console.error('Error ending call:', err);
    }
  };

  // Render participant video
  const renderParticipantVideo = (participant: CallParticipant) => {
    const isLocal = participant.id === 'local';
    const stream = isLocal ? localStream : remoteStreams.get(participant.id);
    const videoRef = (el: HTMLVideoElement | null) => {
      if (el && !isLocal) {
        remoteVideoRefs.current.set(participant.id, el);
      }
    };

    return (
      <div 
        key={participant.id}
        className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video"
      >
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-2">
                {participant.avatar ? (
                  <img 
                    src={participant.avatar} 
                    alt={participant.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <Users className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <span className="text-white text-sm">{participant.name}</span>
            </div>
          </div>
        )}
        
        {/* Participant info overlay */}
        <div className="absolute bottom-2 left-2 right-2">
          <div className="bg-black/50 rounded px-2 py-1 flex items-center justify-between">
            <span className="text-white text-sm font-medium truncate">
              {isLocal ? 'You' : participant.name}
            </span>
            <div className="flex items-center space-x-1">
              {participant.isMuted && <MicOff className="h-3 w-3 text-red-400" />}
              {!participant.isCameraOn && <VideoOff className="h-3 w-3 text-red-400" />}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col h-full bg-gray-900 text-white", className)}>
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            {groupAvatar ? (
              <AvatarImage src={groupAvatar} alt={groupName} />
            ) : (
              <AvatarFallback>
                <Users className="h-5 w-5" />
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h3 className="font-semibold">{groupName}</h3>
            <p className="text-sm text-gray-300">
              {participants.length} {participants.length === 1 ? 'participant' : 'participants'}
              {callDuration > 0 && ` • ${formatDuration(callDuration)}`}
            </p>
          </div>
        </div>
        
        {/* Call controls */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={toggleMute}
            variant={isMuted ? 'destructive' : 'secondary'}
            size="icon"
            className="rounded-full"
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          
          <Button
            onClick={toggleVideo}
            variant={isVideoOn ? 'secondary' : 'destructive'}
            size="icon"
            className="rounded-full"
          >
            {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          
          <Button
            onClick={toggleScreenShare}
            variant={isScreenSharing ? 'default' : 'secondary'}
            size="icon"
            className="rounded-full"
          >
            {isScreenSharing ? (
              <ScreenShareOff className="h-5 w-5" />
            ) : (
              <ScreenShare className="h-5 w-5" />
            )}
          </Button>
          
          <Button
            onClick={handleEndCall}
            variant="destructive"
            size="icon"
            className="rounded-full"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Video grid */}
      <div className="flex-1 p-4 overflow-auto">
        <div className={`grid ${gridColumns} gap-4 h-full`}>
          {/* Local video */}
          {renderParticipantVideo({
            id: 'local',
            name: 'You',
            isMuted: isMuted,
            isCameraOn: isVideoOn,
            stream: localStream || undefined,
          })}
          
          {/* Remote participants */}
          {remoteParticipants.map(participant => (
            renderParticipantVideo(participant)
          ))}
        </div>
      </div>
      
      {/* Hidden audio elements for remote participants */}
      {Array.from(remoteAudioRefs.entries()).map(([id]) => (
        <audio 
          key={`audio-${id}`} 
          ref={el => {
            if (el) {
              remoteAudioRefs.current.set(id, el);
            } else {
              remoteAudioRefs.current.delete(id);
            }
          }}
          autoPlay
          playsInline
          className="hidden"
        />
      ))}
    </div>
  );
}

export default GroupCallInterfaceV2;
