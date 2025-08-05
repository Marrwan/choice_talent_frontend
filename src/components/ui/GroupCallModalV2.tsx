import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { GroupCallInterfaceV2 } from './GroupCallInterfaceV2';
import { useWebRTC } from '@/hooks/useWebRTC';
import { CallState } from '@/services/webrtcService';

export interface GroupCallModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  callId: string;
  groupId: string;
  groupName: string;
  groupAvatar?: string;
  initialParticipants?: Array<{
    id: string;
    name: string;
    avatar?: string;
    isMuted?: boolean;
    isCameraOn?: boolean;
  }>;
  onCallEnd?: () => void;
}

export function GroupCallModalV2({
  isOpen,
  onClose,
  callId,
  groupId,
  groupName,
  groupAvatar,
  initialParticipants = [],
  onCallEnd,
}: GroupCallModalV2Props) {
  const [callState, setCallState] = useState<CallState>('initiating');
  const [error, setError] = useState<Error | null>(null);
  
  const {
    callState: webrtcCallState,
    startCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    participants,
    remoteParticipants,
  } = useWebRTC();

  // Handle WebRTC call state changes
  useEffect(() => {
    if (!isOpen) return;

    console.log('Group call state changed:', webrtcCallState);
    setCallState(webrtcCallState);
    
    // Handle call ended state
    if (webrtcCallState === 'ended') {
      // Close modal after a delay when call ends
      const timer = setTimeout(() => {
        handleClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
    
    // Handle error state
    if (webrtcCallState === 'error') {
      console.error('Group call error:', error);
      // Close modal on error after a delay
      const errorTimer = setTimeout(() => {
        handleClose();
      }, 3000);
      return () => clearTimeout(errorTimer);
    }
  }, [webrtcCallState, error, isOpen]);

  // Initialize group call when modal opens
  useEffect(() => {
    if (isOpen) {
      const initializeGroupCall = async () => {
        try {
          setError(null);
          await startCall(callId, 'video'); // Default to video for group calls
          
          // Add initial participants if provided
          if (initialParticipants.length > 0) {
            // TODO: Implement adding initial participants to the call
            console.log('Initial participants:', initialParticipants);
          }
        } catch (err) {
          console.error('Error initializing group call:', err);
          setError(err instanceof Error ? err : new Error('Failed to initialize group call'));
          setCallState('ended');
        }
      };
      
      initializeGroupCall();
    }
    
    return () => {
      if (callState !== 'idle' && callState !== 'ended') {
        endCall().catch(console.error);
      }
    };
  }, [isOpen, callId, callState, endCall, startCall, initialParticipants]);

  // Handle modal close
  const handleClose = () => {
    if (callState === 'active' || callState === 'initiating' || callState === 'connecting') {
      // End the call if it's active or initializing
      endCall().catch(console.error);
    }
    onClose();
  };

  // Handle call end
  const handleCallEnd = async () => {
    try {
      await endCall();
      onCallEnd?.();
      onClose();
    } catch (err) {
      console.error('Error ending group call:', err);
      setError(err instanceof Error ? err : new Error('Failed to end group call'));
    }
  };

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden border-0 bg-transparent">
        <GroupCallInterfaceV2
          callId={callId}
          groupId={groupId}
          groupName={groupName}
          groupAvatar={groupAvatar}
          initialParticipants={initialParticipants}
          onCallEnd={handleCallEnd}
          className="h-full w-full"
        />
      </DialogContent>
    </Dialog>
  );
}

export default GroupCallModalV2;
