import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CallInterfaceV2 } from './CallInterfaceV2';
import { useWebRTC } from '@/hooks/useWebRTC';
import { CallState } from '@/services/webrtcService';

export interface CallModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  remoteUserId: string;
  remoteUserName: string;
  remoteUserAvatar?: string;
  callType: 'audio' | 'video';
  callDirection: 'incoming' | 'outgoing';
  onCallEnd?: () => void;
  onCallAccept?: () => void;
  onCallDecline?: () => void;
}

export function CallModalV2({
  isOpen,
  onClose,
  remoteUserId,
  remoteUserName,
  remoteUserAvatar,
  callType,
  callDirection,
  onCallEnd,
  onCallAccept,
  onCallDecline,
}: CallModalV2Props) {
  const [callState, setCallState] = useState<'outgoing' | 'incoming' | 'active' | 'ended'>(
    callDirection === 'incoming' ? 'incoming' : 'outgoing'
  );
  
  const { 
    callState: webrtcCallState,
    startCall,
    answerCall,
    endCall,
    error
  } = useWebRTC();

  // Handle WebRTC call state changes
  useEffect(() => {
    if (!isOpen) return;

    console.log('WebRTC call state changed:', webrtcCallState);
    
    switch (webrtcCallState) {
      case 'active':
        setCallState('active');
        break;
      case 'ended':
        setCallState('ended');
        // Close modal after a delay when call ends
        const timer = setTimeout(() => {
          onClose();
        }, 2000);
        return () => clearTimeout(timer);
      case 'error':
        console.error('Call error:', error);
        setCallState('ended');
        // Close modal on error after a delay
        const errorTimer = setTimeout(() => {
          onClose();
        }, 3000);
        return () => clearTimeout(errorTimer);
      default:
        break;
    }
  }, [webrtcCallState, error, isOpen, onClose]);

  // Handle modal close
  const handleClose = () => {
    if (callState === 'active' || callState === 'outgoing') {
      // End the call if it's active or outgoing
      endCall().catch(console.error);
    }
    onClose();
  };

  // Handle call accept
  const handleAcceptCall = async () => {
    try {
      setCallState('active');
      onCallAccept?.();
    } catch (err) {
      console.error('Error accepting call:', err);
      setCallState('ended');
      onClose();
    }
  };

  // Handle call decline/end
  const handleDeclineCall = async () => {
    try {
      await endCall();
      setCallState('ended');
      onCallDecline?.();
      onClose();
    } catch (err) {
      console.error('Error declining call:', err);
    }
  };

  // Handle call end from the interface
  const handleCallEnd = async () => {
    await handleDeclineCall();
  };

  // Initialize call when modal opens for outgoing calls
  useEffect(() => {
    if (isOpen && callDirection === 'outgoing') {
      const initializeOutgoingCall = async () => {
        try {
          await startCall(remoteUserId, callType);
        } catch (err) {
          console.error('Error initializing outgoing call:', err);
          setCallState('ended');
          onClose();
        }
      };
      
      initializeOutgoingCall();
    }
  }, [isOpen, callDirection, remoteUserId, callType, onClose]);

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden border-0 bg-transparent">
        <CallInterfaceV2
          remoteUserId={remoteUserId}
          remoteUserName={remoteUserName}
          remoteUserAvatar={remoteUserAvatar}
          callType={callType}
          callState={callState}
          onCallEnd={handleCallEnd}
          onCallAccept={handleAcceptCall}
          onCallDecline={handleDeclineCall}
          className="h-full w-full"
        />
      </DialogContent>
    </Dialog>
  );
}

export default CallModalV2;
