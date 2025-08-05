import { socketService } from './socketService';

export type CallType = 'audio' | 'video';
export type CallState = 
  | 'idle'
  | 'initiating'
  | 'ringing'
  | 'outgoing_ringing'
  | 'incoming_ringing'
  | 'incoming_group_ringing'
  | 'connecting'
  | 'active'
  | 'ended'
  | 'error';

export interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  isCameraOn: boolean;
  isSpeaking?: boolean;
  stream?: MediaStream | null;
  connectionState?: RTCPeerConnectionState;
}

interface PendingOffer {
  fromSocketId: string;
  offer: RTCSessionDescriptionInit;
  metadata?: {
    callId?: string;
    callType?: CallType;
    isGroupCall?: boolean;
    participants?: string[];
  };
}

export interface CallOptions {
  callType: CallType;
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
  isScreenSharing?: boolean;
  iceServers?: RTCIceServer[];
}

type CallStateChangeHandler = (state: CallState) => void;
type ParticipantChangeHandler = (participants: CallParticipant[]) => void;
type StreamChangeHandler = (stream: MediaStream, participantId: string) => void;

declare global {
  interface Window {
    RTCPeerConnection: typeof RTCPeerConnection;
    RTCSessionDescription: typeof RTCSessionDescription;
    RTCIceCandidate: typeof RTCIceCandidate;
  }
}

export class WebRTCService {
  private static instance: WebRTCService;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private remoteStreams: Map<string, MediaStream> = new Map();
  private callState: CallState = 'idle';
  private currentCallId: string | null = null;
  private currentRoomId: string | null = null;
  private currentCallType: CallType = 'audio';
  private isVideoEnabled = false;
  private isAudioEnabled = true;
  private isScreenSharing = false;
  private iceServers: RTCIceServer[] = [];
  private localParticipantId: string = `user_${Math.random().toString(36).substr(2, 9)}`;
  private participants: Map<string, CallParticipant> = new Map();
  private callStateHandlers: Set<CallStateChangeHandler> = new Set();
  private participantHandlers: Set<ParticipantChangeHandler> = new Set();
  private streamHandlers: Set<StreamChangeHandler> = new Set();
  private pendingIceCandidates: Map<string, RTCIceCandidateInit[]> = new Map();
  private pendingOffer: PendingOffer | null = null;
  private hostId: string | null = null;
  private mediaConstraints: MediaStreamConstraints = {
    audio: true,
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 }
    }
  };

  private constructor() {
    // Initialize with default participant (self)
    this.participants.set(this.localParticipantId, {
      id: this.localParticipantId,
      name: 'You',
      isMuted: false,
      isCameraOn: false,
      isSpeaking: false,
      stream: null
    });
    
    this.initializeSocketListeners();
  }

  public static getInstance(): WebRTCService {
    if (!WebRTCService.instance) {
      WebRTCService.instance = new WebRTCService();
    }
    return WebRTCService.instance;
  }

  // Public API
  public async initializeCall(options: CallOptions): Promise<void> {
    this.currentCallType = options.callType;
    this.isVideoEnabled = options.isVideoEnabled ?? options.callType === 'video';
    this.isAudioEnabled = options.isAudioEnabled ?? true;
    this.iceServers = options.iceServers || [];
    
    try {
      await this.initializeLocalStream();
      this.updateCallState('initiating');
    } catch (error) {
      console.error('Failed to initialize call:', error);
      this.cleanup();
      throw error;
    }
  }

  public async startCall(remoteUserId: string): Promise<void> {
    if (this.callState !== 'initiating') {
      throw new Error('Call not initialized');
    }

    this.currentCallId = `call_${Date.now()}`;
    this.currentRoomId = `room_${this.currentCallId}`;
    
    try {
      // Join the WebRTC room
      socketService.emit('webrtc:join-room', {
        callRoomId: this.currentRoomId,
        callType: this.currentCallType
      });

      // Create an offer
      const peerConnection = this.createPeerConnection(remoteUserId);
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: this.currentCallType === 'video'
      });
      
      await peerConnection.setLocalDescription(offer);
      
      // Send the offer
      this.emitToSocket('webrtc:offer', {
        callRoomId: this.currentRoomId,
        targetSocketId: remoteUserId,
        offer: peerConnection.localDescription
      });

      this.updateCallState('outgoing_ringing');
    } catch (error) {
      console.error('Error starting call:', error);
      this.cleanup();
      throw error;
    }
  }

  public async answerCall(callId: string, callerId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    if (this.callState !== 'idle' && 
        this.callState !== 'incoming_ringing' && 
        this.callState !== 'incoming_group_ringing') {
      throw new Error('Cannot answer call in current state');
    }

    this.currentCallId = callId;
    this.currentRoomId = `room_${callId}`;
    
    try {
      // Join the WebRTC room
      socketService.emit('webrtc:join-room', {
        callRoomId: this.currentRoomId,
        callType: this.currentCallType
      });

      // Create a peer connection
      const peerConnection = this.createPeerConnection(callerId);
      
      // Set remote description
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Create and set local description
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      // Send the answer
      this.emitToSocket('webrtc:answer', {
        callRoomId: this.currentRoomId,
        targetSocketId: callerId,
        answer: peerConnection.localDescription
      });

      this.updateCallState('active');
    } catch (error) {
      console.error('Error answering call:', error);
      this.cleanup();
      throw error;
    }
  }

  public async endCall(): Promise<void> {
    if (this.callState === 'idle') return;
    
    // Notify other participants
    if (this.currentRoomId) {
      socketService.emit('webrtc:leave-room', {
        callRoomId: this.currentRoomId
      });
    }
    
    this.cleanup();
    this.updateCallState('ended');
  }

  public async toggleMute(): Promise<boolean> {
    if (!this.localStream) return false;
    
    const audioTracks = this.localStream.getAudioTracks();
    if (audioTracks.length === 0) return false;
    
    const newMuteState = !audioTracks[0].enabled;
    audioTracks[0].enabled = newMuteState;
    
    // Update participant state
    const participant = this.getLocalParticipant();
    if (participant) {
      participant.isMuted = !newMuteState;
      this.notifyParticipantUpdate(participant);
    }
    
    return newMuteState;
  }

  public async toggleVideo(): Promise<boolean> {
    if (!this.localStream) return false;
    
    const videoTracks = this.localStream.getVideoTracks();
    if (videoTracks.length === 0) return false;
    
    const newVideoState = !videoTracks[0].enabled;
    videoTracks[0].enabled = newVideoState;
    
    // Update participant state
    const participant = this.getLocalParticipant();
    if (participant) {
      participant.isCameraOn = newVideoState;
      this.notifyParticipantUpdate(participant);
    }
    
    return newVideoState;
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  public getRemoteStreams(): Map<string, MediaStream> {
    return new Map(this.remoteStreams);
  }

  public getCallState(): CallState {
    return this.callState;
  }

  public getCallId(): string | null {
    return this.currentCallId;
  }

  public onCallStateChange(handler: CallStateChangeHandler): () => void {
    this.callStateHandlers.add(handler);
    return () => this.callStateHandlers.delete(handler);
  }

  public onParticipantsChange(handler: ParticipantChangeHandler): () => void {
    this.participantHandlers.add(handler);
    return () => this.participantHandlers.delete(handler);
  }

  public onStreamChange(handler: StreamChangeHandler): () => void {
    this.streamHandlers.add(handler);
    return () => this.streamHandlers.delete(handler);
  }

  /**
   * Initialize socket event listeners for WebRTC signaling
   */
  private initializeSocketListeners(): void {
    try {
      const socket = socketService.getSocket();
      if (!socket) {
        console.error('Socket not initialized');
        return;
      }
      
      // Handle incoming call offer
      socket.on('webrtc:offer', this.handleIncomingOffer.bind(this));
      
      // Handle answer to our offer
      socket.on('webrtc:answer', this.handleAnswer.bind(this));
      
      // Handle ICE candidates
      socket.on('webrtc:ice-candidate', this.handleICECandidate.bind(this));
      
      // Handle room events
      socket.on('webrtc:room-joined', this.handleRoomJoined.bind(this));
      socket.on('webrtc:participant-joined', this.handleParticipantJoined.bind(this));
      socket.on('webrtc:participant-left', this.handleParticipantLeft.bind(this));
      
      // Handle errors
      socket.on('webrtc:signaling-error', this.handleSignalingError.bind(this));
      
      console.log('WebRTC socket listeners initialized');
    } catch (error) {
      console.error('Error initializing socket listeners:', error);
    }
  }
  // Private methods
  private async initializeLocalStream(): Promise<void> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: this.isAudioEnabled,
        video: this.isVideoEnabled ? this.mediaConstraints.video : false
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Local stream initialized:', this.localStream);

      // Update local participant
      const localParticipant = this.participants.get(this.localParticipantId);
      if (localParticipant) {
        localParticipant.stream = this.localStream;
        localParticipant.isCameraOn = this.isVideoEnabled;
        localParticipant.isMuted = !this.isAudioEnabled;
      }
    } catch (error) {
      console.error('Error initializing local stream:', error);
      throw error;
    }
  }

  private createPeerConnection(remoteSocketId: string): RTCPeerConnection {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Add local stream to the peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.emitToSocket('webrtc:ice-candidate', {
          callRoomId: this.currentRoomId,
          targetSocketId: remoteSocketId,
          candidate: event.candidate
        });
      }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('Remote stream received:', event.streams[0]);
      this.remoteStreams.set(remoteSocketId, event.streams[0]);
      this.notifyStreamChange(remoteSocketId, event.streams[0]);
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Peer connection state:', peerConnection.connectionState);
      if (peerConnection.connectionState === 'connected') {
        this.updateCallState('active');
      } else if (peerConnection.connectionState === 'failed' || 
                 peerConnection.connectionState === 'disconnected') {
        this.cleanup();
        this.updateCallState('ended');
      }
    };

    this.peerConnections.set(remoteSocketId, peerConnection);
    return peerConnection;
  }

  private getLocalParticipant(): CallParticipant | undefined {
    return this.participants.get(this.localParticipantId);
  }

  private emitToSocket(event: string, data: any): void {
    const socket = socketService.getSocket();
    if (socket?.connected) {
      socket.emit(event, data);
    }
  }

  private cleanup(): void {
    console.log('Cleaning up WebRTC resources');
    
    try {
      // Close all peer connections
      this.peerConnections.forEach((pc, id) => {
        pc.close();
      });
      this.peerConnections.clear();

      // Stop all media tracks
      if (this.localStream) {
        this.stopTracks(this.localStream);
        this.localStream = null;
      }

      if (this.screenStream) {
        this.stopTracks(this.screenStream);
        this.screenStream = null;
      }

      // Clear remote streams
      this.remoteStreams.clear();

      // Clear pending candidates
      this.pendingIceCandidates.clear();
      this.pendingOffer = null;

      // Reset state
      this.currentCallId = null;
      this.currentRoomId = null;
      this.isVideoEnabled = false;
      this.isAudioEnabled = true;
      this.isScreenSharing = false;
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  private stopTracks(stream: MediaStream): void {
    if (!stream) return;

    stream.getTracks().forEach((track) => {
      try {
        track.stop();
        track.enabled = false;
      } catch (error) {
        console.error('Error stopping track:', error);
      }
    });
  }

  private updateCallState(newState: CallState): void {
    try {
      this.callState = newState;
      console.log('Call state updated to:', newState);

      // Notify state change handlers
      this.callStateHandlers.forEach((handler) => {
        try {
          handler(newState);
        } catch (err) {
          console.error('Error in state change handler:', err);
        }
      });
    } catch (err) {
      console.error('Error updating call state:', err);
    }
  }

  private notifyParticipantUpdate(participant: CallParticipant): void {
    try {
      this.participants.set(participant.id, participant);

      const participantArray = Array.from(this.participants.values());
      this.participantHandlers.forEach((handler) => {
        try {
          handler(participantArray);
        } catch (error) {
          console.error('Error in participant update handler:', error);
        }
      });
    } catch (error) {
      console.error('Error notifying participant update:', error);
    }
  }

  private notifyStreamChange(socketId: string, stream: MediaStream | null): void {
    try {
      if (!socketId) {
        console.error('Invalid socketId for stream change');
        return;
      }

      if (stream) {
        this.remoteStreams.set(socketId, stream);
      } else {
        this.remoteStreams.delete(socketId);
      }

      // Notify all stream change handlers
      this.streamChangeHandlers.forEach((handler) => {
        try {
          if (typeof handler === 'function') {
            handler(socketId, stream);
          }
        } catch (error) {
          console.error('Error in stream change handler:', error);
        }
      });
    } catch (error) {
      console.error('Error notifying stream change:', error);
    }
  }

  private handleIncomingOffer(data: unknown): void {
    try {
      if (!data || typeof data !== 'object') {
        console.error('Invalid offer data format:', data);
        return;
      }

      const { offer, fromSocketId, metadata } = data as {
        offer: RTCSessionDescriptionInit;
        fromSocketId: string;
        metadata?: {
          callId?: string;
          callType?: CallType;
          isGroupCall?: boolean;
          participants?: string[];
        };
      };

      if (!offer || !fromSocketId) {
        console.error('Missing required offer data');
        return;
      }

      console.log('Received offer from:', fromSocketId, offer);

      if (this.callState !== 'idle' && this.callState !== 'incoming_ringing' && this.callState !== 'incoming_group_ringing') {
        // Busy or in another call
        this.emitToSocket('webrtc:signaling-error', {
          targetSocketId: fromSocketId,
          error: 'User is busy',
          details: { callState: this.callState },
        });
        return;
      }

      // Store the pending offer
      this.pendingOffer = {
        fromSocketId,
        offer,
        metadata: {
          callId: metadata?.callId || `call_${Date.now()}`,
          callType: metadata?.callType || 'audio',
          isGroupCall: metadata?.isGroupCall || false,
          participants: metadata?.participants || [],
        },
      };

      // Update call state based on call type
      const callState = this.pendingOffer.metadata.isGroupCall ? 'incoming_group_ringing' : 'incoming_ringing';
      this.updateCallState(callState);
    } catch (error) {
      console.error('Error handling incoming offer:', error);
    }
  }

  private handleAnswer(data: unknown): void {
    try {
      if (!data || typeof data !== 'object') {
        console.error('Invalid answer data format:', data);
        return;
      }

      const { answer, fromSocketId } = data as {
        answer: RTCSessionDescriptionInit;
        fromSocketId: string;
      };

      if (!answer || !fromSocketId) {
        console.error('Missing required answer data');
        return;
      }

      console.log('Received answer from:', fromSocketId, answer);

      const peerConnection = this.peerConnections.get(fromSocketId);
      if (!peerConnection) {
        console.warn('No peer connection found for answer from:', fromSocketId);
        return;
      }

      const remoteDesc = new RTCSessionDescription(answer);
      peerConnection.setRemoteDescription(remoteDesc).catch((error) => {
        console.error('Error setting remote description:', error);
      });
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  private handleICECandidate(data: unknown): void {
    try {
      if (!data || typeof data !== 'object') {
        console.error('Invalid ICE candidate data format:', data);
        return;
      }

      const { candidate, fromSocketId } = data as {
        candidate: RTCIceCandidateInit;
        fromSocketId: string;
      };

      if (!candidate || !fromSocketId) {
        console.error('Missing required ICE candidate data');
        return;
      }

      console.log('Received ICE candidate from:', fromSocketId, candidate);

      const peerConnection = this.peerConnections.get(fromSocketId);
      if (!peerConnection) {
        console.warn('No peer connection found for ICE candidate from:', fromSocketId);
        // Store candidate for later use when peer connection is established
        const pendingCandidates = this.pendingIceCandidates.get(fromSocketId) || [];
        pendingCandidates.push(candidate);
        this.pendingIceCandidates.set(fromSocketId, pendingCandidates);
        return;
      }

      peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch((error) => {
        console.error('Error adding ICE candidate:', error);
      });
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  private handleCallEnded(data: unknown): void {
    try {
      if (!data || typeof data !== 'object') {
        console.error('Invalid call end data format:', data);
        return;
      }

      const { fromSocketId, reason } = data as {
        fromSocketId: string;
        reason?: string;
      };

      if (!fromSocketId) {
        console.error('Missing required call end data');
        return;
      }

      console.log('Call ended by:', fromSocketId, 'Reason:', reason || 'No reason provided');

      // Only cleanup if we're in a call
      if (this.callState !== 'idle') {
        this.cleanup();
        this.updateCallState('ended');
      }
    } catch (error) {
      console.error('Error handling call end:', error);
    }
  }

  private handleParticipantUpdate(data: unknown): void {
    try {
      if (!data || typeof data !== 'object') {
        console.error('Invalid participant data format:', data);
        return;
      }

      const participant = data as CallParticipant;

      if (!participant.id) {
        console.error('Invalid participant data received:', participant);
        return;
      }

      console.log('Participant update:', participant);
      this.notifyParticipantUpdate(participant);
    } catch (error) {
      console.error('Error handling participant update:', error);
    }
  }

  private handleRoomJoined(data: any): void {
    console.log('Joined WebRTC room:', data);
    // Implementation for handling room joined events
  }

  private handleParticipantJoined(data: any): void {
    console.log('Participant joined:', data);
    // Implementation for handling participant joined events
  }

  private handleParticipantLeft(data: any): void {
    console.log('Participant left:', data);
    // Implementation for handling participant left events
  }

  private handleSignalingError(data: unknown): void {
    try {
      if (!data || typeof data !== 'object') {
        console.error('Invalid error data format:', data);
        return;
      }

      const { error, details } = data as {
        error: unknown;
        details?: unknown;
      };

      if (!error) {
        console.error('Missing error information in signaling error');
        return;
      }

      const errorInfo = error instanceof Error ? error : new Error(String(error));
      console.error('Signaling error:', errorInfo, details);

      // Update call state to reflect the error
      this.updateCallState('error');
    } catch (error) {
      console.error('Error handling signaling error:', error);
    }
  }
}

// Export the WebRTC service instance
export const webrtcService = WebRTCService.getInstance();

// Export types
export type { CallType, CallState, CallParticipant };

export default webrtcService;
