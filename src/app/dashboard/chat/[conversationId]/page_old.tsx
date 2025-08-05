'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { AuthenticatedImage } from '@/components/ui/authenticated-image'
import { useAuth } from '@/lib/store'
import { chatService, Message, User } from '@/services/chatService'
import { socketService } from '@/services/socketService'
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  Image, 
  File, 
  Download, 
  Trash2, 
  Check,
  CheckCheck,
  User as UserIcon,
  Circle,
  Phone,
  Video
} from 'lucide-react'
import { CallInterface } from '@/components/ui/call-interface'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  onDelete: (messageId: string) => void
  showSender?: boolean // Added for group chat
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, onDelete, showSender }) => {
  const [showActions, setShowActions] = useState(false)
  
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // File download function
  const downloadFile = async (fileUrl: string, fileName: string) => {
    try {
      const token = localStorage.getItem('choice_talent_token')
      if (!token) {
        console.error('No authentication token found')
        return
      }

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.101:3001'
      const response = await fetch(`${backendUrl}${fileUrl}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`)
      }

      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && (
          <div className="flex items-center mb-1">
            <Avatar className="h-6 w-6 mr-2">
              {message.sender.profilePicture ? (
                <AuthenticatedImage
                  src={message.sender.profilePicture}
                  alt={message.sender.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-full">
                  <UserIcon className="h-3 w-3 text-gray-400" />
                </div>
              )}
            </Avatar>
            <span className="text-xs text-gray-600 font-medium">
              {message.sender.realName || message.sender.name}
            </span>
          </div>
        )}
        
        <div
          className={`relative rounded-lg px-3 py-2 ${
            isOwn 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-900'
          }`}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {/* Message content */}
          {message.content && (
            <p className="text-sm break-words">{message.content}</p>
          )}
          
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment) => {
                const FileIcon = getFileIcon(attachment.mimeType)
                
                if (attachment.mimeType.startsWith('image/')) {
                  return (
                    <div key={attachment.id} className="relative">
                      <AuthenticatedImage
                        src={attachment.thumbnailUrl || attachment.fileUrl}
                        alt={attachment.originalName}
                        className="max-w-full h-auto rounded cursor-pointer"
                        onClick={() => downloadFile(attachment.fileUrl, attachment.originalName)}
                      />
                      <div className="absolute top-2 right-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                          onClick={() => downloadFile(attachment.fileUrl, attachment.originalName)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                }
                return (
                  <div 
                    key={attachment.id} 
                    className="flex items-center space-x-2 p-2 rounded border border-gray-200 bg-white/10 cursor-pointer hover:bg-white/20"
                    onClick={() => downloadFile(attachment.fileUrl, attachment.originalName)}
                  >
                    <FileIcon className="h-4 w-4" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{attachment.originalName}</p>
                      <p className="text-xs opacity-75">{formatFileSize(attachment.fileSize)}</p>
                    </div>
                    <Download className="h-4 w-4" />
                  </div>
                )
              })}
            </div>
          )}
          
          {/* Message actions */}
          {showActions && isOwn && (
            <div className="absolute top-0 right-0 transform translate-x-full -translate-y-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 bg-white border-red-200 hover:bg-red-50"
                onClick={() => onDelete(message.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Message metadata */}
        <div className={`flex items-center space-x-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-500">
            {formatTime(message.createdAt)}
          </span>
          {isOwn && (
            <div className="flex items-center">
              {message.isRead ? (
                <CheckCheck className="h-3 w-3 text-blue-500" />
              ) : (
                <Check className="h-3 w-3 text-gray-400" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface TypingIndicatorProps {
  isTyping: boolean
  user?: User
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isTyping, user }) => {
  if (!isTyping || !user) return null
  
  return (
    <div className="flex items-center space-x-2 mb-4">
      <Avatar className="h-6 w-6">
        {user.profilePicture ? (
          <img 
            src={user.profilePicture} 
            alt={user.name} 
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-full">
            <UserIcon className="h-3 w-3 text-gray-400" />
          </div>
        )}
      </Avatar>
      <div className="flex items-center space-x-1 text-gray-500">
        <span className="text-sm">{user.realName || user.name} is typing</span>
        <div className="flex space-x-1">
          <Circle className="h-1 w-1 fill-current animate-pulse" />
          <Circle className="h-1 w-1 fill-current animate-pulse" style={{ animationDelay: '0.2s' }} />
          <Circle className="h-1 w-1 fill-current animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <div>Hello</div>
  )
}