export interface CallInterfaceProps {
  callState: "idle" | "initiating" | "ringing" | "incoming_ringing" | "outgoing_ringing" | "active" | "ended" | "connecting"
  isMuted: boolean
  onToggleMute: () => void
  onEndCall: () => void
  participantName?: string
  participantAvatar?: string
  callDuration: number
  onToggleSpeaker?: () => void
  isSpeakerOn?: boolean
  isVideo?: boolean
  isCameraOn?: boolean
  onToggleCamera?: () => void
  localVideoRef?: React.RefObject<HTMLVideoElement>
  remoteVideoRef?: React.RefObject<HTMLVideoElement>
  onAcceptCall?: () => void
  onDeclineCall?: () => void
  // Add stream props for better audio/video handling
  localStream?: MediaStream | null
  remoteStream?: MediaStream | null
}
