import React, { useEffect, useRef } from 'react'

interface CallModalProps {
  open: boolean
  onClose?: () => void
  callType: 'audio' | 'video'
  callState: 'ringing' | 'active' | 'ended'
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  onAccept?: () => void
  onDecline?: () => void
  onEnd?: () => void
  onToggleAudio?: () => void
  onToggleVideo?: () => void
  onFlipCamera?: () => void
  isMuted?: boolean
  isVideoEnabled?: boolean
  isFlipped?: boolean
  remoteUser?: { name: string; avatar?: string }
  timer?: string
  speakerOn?: boolean
  onToggleSpeaker?: () => void
}

const RINGTONE_URL = '/ringtone.mp3'

export const CallModal: React.FC<CallModalProps> = ({
  open,
  // onClose,
  callType,
  callState,
  localStream,
  remoteStream,
  onAccept,
  onDecline,
  onEnd,
  onToggleAudio,
  onToggleVideo,
  onFlipCamera,
  isMuted,
  isVideoEnabled,
  isFlipped,
  remoteUser,
  timer,
  speakerOn,
  onToggleSpeaker
}) => {
  const localVideoRef = React.useRef<HTMLVideoElement>(null)
  const remoteVideoRef = React.useRef<HTMLVideoElement>(null)
  const ringtoneRef = useRef<HTMLAudioElement>(null)
  const remoteAudioRef = useRef<HTMLAudioElement>(null)

  // Attach remote audio stream for audio calls
  useEffect(() => {
    if (callType === 'audio' && remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream
    }
  }, [remoteStream, callType])

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [localStream, remoteStream])

  // Play/stop ringtone
  useEffect(() => {
    if ((callState === 'ringing' || callState === 'incoming_ringing' || callState === 'outgoing_ringing') && ringtoneRef.current) {
      ringtoneRef.current.currentTime = 0
      ringtoneRef.current.play().catch(() => {})
    } else if (ringtoneRef.current) {
      ringtoneRef.current.pause()
      ringtoneRef.current.currentTime = 0
    }
    // Stop ringtone on active/connecting/ended
    if ((callState === 'active' || callState === 'connecting' || callState === 'ended') && ringtoneRef.current) {
      ringtoneRef.current.pause()
      ringtoneRef.current.currentTime = 0
    }
    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause()
        ringtoneRef.current.currentTime = 0
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = null
      }
    }
  }, [callState, open])

  // Always attach remote audio stream for audio calls
  useEffect(() => {
    if (callType === 'audio' && remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream
    } else if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null
    }
  }, [remoteStream, callType])

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  if (!open) return null

  if (callType === 'audio') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <audio ref={ringtoneRef} src={RINGTONE_URL} loop preload="auto" />
        {/* Hidden audio for remote stream */}
        <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs mx-auto p-8 flex flex-col items-center relative">
          {/* Profile Pic */}
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden border-4 border-green-500">
            {remoteUser?.avatar ? (
              <img src={remoteUser.avatar} alt={remoteUser.name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#e5e7eb"/><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.418 0-8 2.239-8 5v1a1 1 0 001 1h14a1 1 0 001-1v-1c0-2.761-3.582-5-8-5z" fill="#9ca3af"/></svg>
              </div>
            )}
          </div>
          {/* Name */}
          <div className="font-bold text-xl text-gray-900 mb-1 text-center">{remoteUser?.name || 'Unknown User'}</div>
          {/* Status */}
          <div className="text-green-600 font-medium mb-6 text-center text-lg">
            {callState === 'ringing' ? 'Ringing…' : callState === 'active' ? (timer || 'In Call') : 'Call Ended'}
          </div>
          {/* Controls */}
          <div className="flex items-center justify-center space-x-6 mt-2">
            {callState === 'ringing' && onDecline && (
              <button onClick={onDecline} aria-label="Decline Call" className="bg-red-500 hover:bg-red-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg focus:outline-none">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M6.225 17.775a1 1 0 01-1.414-1.414l12-12a1 1 0 111.414 1.414l-12 12z" fill="white"/></svg>
              </button>
            )}
            {callState === 'ringing' && onAccept && (
              <button onClick={onAccept} aria-label="Accept Call" className="bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg focus:outline-none">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M7 17a1 1 0 001.707.707l8-8a1 1 0 00-1.414-1.414l-8 8A1 1 0 007 17z" fill="white"/></svg>
              </button>
            )}
            {callState === 'active' && onToggleAudio && (
              <button onClick={onToggleAudio} aria-label={isMuted ? 'Unmute' : 'Mute'} className={`rounded-full w-14 h-14 flex items-center justify-center shadow-lg focus:outline-none ${isMuted ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} text-white`}>
                {isMuted ? (
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M9 9v6h4l5 5V4l-5 5H9z" fill="white"/></svg>
                ) : (
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M9 9v6h4l5 5V4l-5 5H9z" fill="white"/></svg>
                )}
              </button>
            )}
            {callState === 'active' && onToggleSpeaker && (
              <button onClick={onToggleSpeaker} aria-label={speakerOn ? 'Speaker Off' : 'Speaker On'} className={`rounded-full w-14 h-14 flex items-center justify-center shadow-lg focus:outline-none ${speakerOn ? 'bg-blue-500' : 'bg-gray-200'} text-white`}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 00-1.5-3.356v6.712A4.5 4.5 0 0016.5 12zm2.5 0a7 7 0 00-2.5-5.291v2.06A5 5 0 0121 12a5 5 0 01-4.5 4.95v2.06A7 7 0 0019 12z" fill="currentColor"/></svg>
              </button>
            )}
            {callState === 'active' && onEnd && (
              <button onClick={onEnd} aria-label="End Call" className="bg-red-500 hover:bg-red-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg focus:outline-none">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M6.225 17.775a1 1 0 01-1.414-1.414l12-12a1 1 0 111.414 1.414l-12 12z" fill="white"/></svg>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-6 flex flex-col items-center">
        {/* Remote user info */}
        <div className="flex flex-col items-center mb-4">
          {remoteUser?.avatar ? (
            <img src={remoteUser.avatar} alt={remoteUser.name} className="w-16 h-16 rounded-full object-cover mb-2" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#e5e7eb"/><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.418 0-8 2.239-8 5v1a1 1 0 001 1h14a1 1 0 001-1v-1c0-2.761-3.582-5-8-5z" fill="#9ca3af"/></svg>
            </div>
          )}
          <div className="font-semibold text-lg text-gray-900">{remoteUser?.name || 'Unknown User'}</div>
          {timer && <div className="text-xs text-gray-500 mt-1">{timer}</div>}
        </div>
        {/* Call State: Ringing */}
        {callState === 'ringing' && (
          <>
            <div className="text-blue-600 font-medium mb-4">Ringing...</div>
            <div className="flex space-x-4">
              {onAccept && (
                <button onClick={onAccept} className="bg-green-500 hover:bg-green-600 text-white flex items-center px-4 py-2 rounded-lg font-semibold">Accept</button>
              )}
              {onDecline && (
                <button onClick={onDecline} className="bg-red-500 hover:bg-red-600 text-white flex items-center px-4 py-2 rounded-lg font-semibold">Decline</button>
              )}
            </div>
          </>
        )}
        {/* Call State: Active */}
        {callState === 'active' && (
          <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'flex-row space-x-4'} w-full items-center justify-center mb-4`}>
            {/* Remote Video/Audio */}
            <div className="relative flex-1 flex items-center justify-center">
              {callType === 'video' && remoteStream ? (
                <video ref={remoteVideoRef} autoPlay playsInline className="rounded-lg w-full h-48 object-cover bg-black" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#e5e7eb"/><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.418 0-8 2.239-8 5v1a1 1 0 001 1h14a1 1 0 001-1v-1c0-2.761-3.582-5-8-5z" fill="#9ca3af"/></svg>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs rounded px-2 py-1">Remote</div>
            </div>
            {/* Local Video/Audio */}
            <div className="relative flex-1 flex items-center justify-center">
              {callType === 'video' && localStream ? (
                <video ref={localVideoRef} autoPlay playsInline muted className="rounded-lg w-full h-32 object-cover bg-black" style={{ transform: isFlipped ? 'scaleX(-1)' : undefined }} />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#e5e7eb"/><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.418 0-8 2.239-8 5v1a1 1 0 001 1h14a1 1 0 001-1v-1c0-2.761-3.582-5-8-5z" fill="#9ca3af"/></svg>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs rounded px-2 py-1">You</div>
            </div>
          </div>
        )}
        {/* Call Controls (Active) */}
        {callState === 'active' && (
          <div className="flex items-center justify-center space-x-4 mt-2">
            <button onClick={onToggleAudio} className={`rounded-full w-16 h-16 flex items-center justify-center shadow-lg focus:outline-none ${isMuted ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} text-white`}>
              {isMuted ? (
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M9 9v6h4l5 5V4l-5 5H9z" fill="white"/></svg>
              ) : (
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M9 9v6h4l5 5V4l-5 5H9z" fill="white"/></svg>
              )}
            </button>
            {callType === 'video' && (
              <button onClick={onToggleVideo} className={`rounded-full w-16 h-16 flex items-center justify-center shadow-lg focus:outline-none ${!isVideoEnabled ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} text-white`}>
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M17 10.5V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-3.5l4 4v-11l-4 4z" fill="white"/></svg>
              </button>
            )}
            {callType === 'video' && (
              <button onClick={onFlipCamera} className="rounded-full w-16 h-16 flex items-center justify-center shadow-lg focus:outline-none bg-blue-500 hover:bg-blue-600 text-white">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M17 10.5V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-3.5l4 4v-11l-4 4z" fill="white"/></svg>
              </button>
            )}
            <button onClick={onEnd} className="bg-red-500 hover:bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg focus:outline-none">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M6.225 17.775a1 1 0 01-1.414-1.414l12-12a1 1 0 111.414 1.414l-12 12z" fill="white"/></svg>
            </button>
          </div>
        )}
        {/* Call Ended */}
        {callState === 'ended' && (
          <div className="text-red-500 font-medium mt-4">Call Ended</div>
        )}
      </div>
    </div>
  )
} 