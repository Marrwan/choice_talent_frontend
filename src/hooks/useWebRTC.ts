import { useEffect, useState, useCallback, useRef } from 'react';
import { webrtcService, CallState, CallType, CallParticipant } from '@/services/webrtcService';

export const useWebRTC = () => {
  const [callState, setCallState] = useState<CallState>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  
  const callDurationRef = useRef<NodeJS.Timeout | null>(null);
  const callStartTimeRef = useRef<number | null>(null);

  // Update call duration every second
  useEffect(() => {
    if (callState === 'active' && callStartTimeRef.current) {
      callDurationRef.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTimeRef.current!) / 1000));
      }, 1000);
    } else if (callDurationRef.current) {
      clearInterval(callDurationRef.current);
      callDurationRef.current = null;
    }

    return () => {
      if (callDurationRef.current) {
        clearInterval(callDurationRef.current);
      }
    };
  }, [callState]);

  // Initialize WebRTC service listeners
  useEffect(() => {
    const handleCallStateChange = (newState: CallState) => {
      setCallState(newState);
      
      if (newState === 'active') {
        callStartTimeRef.current = Date.now();
        setCallDuration(0);
      } else if (['ended', 'idle'].includes(newState)) {
        callStartTimeRef.current = null;
        setCallDuration(0);
        setActiveCallId(null);
      }
    };

    const handleParticipantsChange = (newParticipants: CallParticipant[]) => {
      setParticipants(newParticipants);
      
      // Update local state based on local participant
      const localParticipant = newParticipants.find(p => p.id === 'local');
      if (localParticipant) {
        setIsMuted(localParticipant.isMuted);
        setIsVideoOn(localParticipant.isCameraOn ?? false);
      }
    };

    const handleStreamChange = (stream: MediaStream, participantId: string) => {
      setRemoteStreams(prev => {
        const newStreams = new Map(prev);
        newStreams.set(participantId, stream);
        return newStreams;
      });
    };

    // Subscribe to WebRTC service events
    const unsubscribeCallState = webrtcService.onCallStateChange(handleCallStateChange);
    const unsubscribeParticipants = webrtcService.onParticipantsChange(handleParticipantsChange);
    const unsubscribeStreams = webrtcService.onStreamChange(handleStreamChange);

    // Clean up on unmount
    return () => {
      unsubscribeCallState();
      unsubscribeParticipants();
      unsubscribeStreams();
      
      if (callDurationRef.current) {
        clearInterval(callDurationRef.current);
      }
      
      // Clean up any active calls when the hook unmounts
      if (callState !== 'idle') {
        webrtcService.endCall();
      }
    };
  }, [callState]);

  // Initialize a new call
  const initializeCall = useCallback(async (callType: CallType = 'audio') => {
    try {
      setError(null);
      await webrtcService.initializeCall({
        callType,
        isVideoEnabled: callType === 'video',
        isAudioEnabled: true,
      });
      
      // Set up local stream
      const stream = webrtcService.getLocalStream();
      if (stream) {
        setLocalStream(stream);
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize call'));
      return false;
    }
  }, []);

  // Start a new call to a remote user
  const startCall = useCallback(async (remoteUserId: string, callType: CallType = 'audio') => {
    try {
      setError(null);
      
      // Initialize the call first
      const initialized = await initializeCall(callType);
      if (!initialized) return false;
      
      // Start the call
      await webrtcService.startCall(remoteUserId);
      setActiveCallId(webrtcService.getCallId());
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to start call'));
      return false;
    }
  }, [initializeCall]);

  // Answer an incoming call
  const answerCall = useCallback(async (callId: string, callerId: string, offer: RTCSessionDescriptionInit) => {
    try {
      setError(null);
      await webrtcService.answerCall(callId, callerId, offer);
      setActiveCallId(callId);
      
      // Set up local stream if not already set
      const stream = webrtcService.getLocalStream();
      if (stream) {
        setLocalStream(stream);
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to answer call'));
      return false;
    }
  }, []);

  // End the current call
  const endCall = useCallback(async () => {
    try {
      setError(null);
      await webrtcService.endCall();
      setLocalStream(null);
      setRemoteStreams(new Map());
      setActiveCallId(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to end call'));
      return false;
    }
  }, []);

  // Toggle mute state
  const toggleMute = useCallback(async () => {
    try {
      const newMuteState = await webrtcService.toggleMute();
      setIsMuted(!newMuteState);
      return newMuteState;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to toggle mute'));
      return !isMuted;
    }
  }, [isMuted]);

  // Toggle video state
  const toggleVideo = useCallback(async () => {
    try {
      const newVideoState = await webrtcService.toggleVideo();
      setIsVideoOn(newVideoState);
      return newVideoState;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to toggle video'));
      return isVideoOn;
    }
  }, [isVideoOn]);

  // Toggle screen sharing
  const toggleScreenShare = useCallback(async () => {
    try {
      // TODO: Implement screen sharing
      const newScreenShareState = !isScreenSharing;
      setIsScreenSharing(newScreenShareState);
      return newScreenShareState;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to toggle screen share'));
      return isScreenSharing;
    }
  }, [isScreenSharing]);

  // Get remote participants (excluding local)
  const remoteParticipants = participants.filter(p => p.id !== 'local');

  return {
    // State
    callState,
    localStream,
    remoteStreams,
    participants,
    remoteParticipants,
    activeCallId,
    isMuted,
    isVideoOn,
    isScreenSharing,
    callDuration,
    error,
    
    // Actions
    initializeCall,
    startCall,
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    
    // Derived state
    isInCall: callState !== 'idle' && callState !== 'ended',
    isRinging: callState === 'ringing' || callState === 'incoming_ringing' || callState === 'outgoing_ringing',
    isConnecting: callState === 'connecting' || callState === 'initiating',
    isActive: callState === 'active',
  };
};

export default useWebRTC;
