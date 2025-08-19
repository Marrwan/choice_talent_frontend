"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { AuthenticatedImage } from '@/components/ui/authenticated-image'
import { useAuth } from '@/lib/store'
import { chatService, Message, User, Conversation } from '@/services/chatService'
import { socketService, setupSocketServiceReference } from '@/services/socketService'
import { useToast } from '@/lib/useToast'
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
  Users
} from 'lucide-react'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  onDelete: (messageId: string) => void
  showSender?: boolean // For group chat
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

  const downloadFile = async (fileUrl: string, fileName: string) => {
    try {
      const token = localStorage.getItem('choice_talent_token')
      if (!token) {
        console.error('No authentication token found')
        return
      }

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
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
        {!isOwn && showSender && (
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
          {message.content && (
            <p className="text-sm break-words">{message.content}</p>
          )}
          
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
  const router = useRouter()
  const { conversationId } = useParams()
  const { user: currentUser } = useAuth()
  const toast = useToast()
  
  // Chat state
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState<User | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    // Set up socket service reference for auth store
    setupSocketServiceReference()
    
    const token = localStorage.getItem('choice_talent_token')
    if (token && currentUser && !socketService.isConnected()) {
      socketService.connect(token)
    }
  }, [currentUser])

  // Fetch conversation and messages
  useEffect(() => {
    if (!conversationId || !currentUser) return
    
    const fetchConversation = async () => {
      try {
        const convRes = await chatService.getConversation(conversationId as string)
        if (convRes.success) {
          setConversation(convRes.data)
        }
      } catch (error) {
        console.error('Error fetching conversation:', error)
      }
    }

    const fetchMessages = async () => {
      try {
        const res = await chatService.getMessages(conversationId as string)
        if (res.success) {
          setMessages(res.data)
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    fetchConversation()
    fetchMessages()
    
    // Ensure socket is connected before joining conversation
    const joinConversationWithRetry = () => {
      if (socketService.isConnected()) {
        socketService.joinConversation(conversationId as string)
      } else {
        setTimeout(joinConversationWithRetry, 1000)
      }
    }
    
    joinConversationWithRetry()
    
    return () => {
      if (socketService.isConnected()) {
        socketService.leaveConversation(conversationId as string)
      }
    }
  }, [conversationId, currentUser])

  // Socket event listeners
  useEffect(() => {
    const handleNewMessage = (...args: unknown[]) => {
      const data = args[0] as any
      
      // Handle different data formats
      let messageData: Message
      let msgConversationId: string
      
      if (data.message && data.conversationId) {
        messageData = data.message
        msgConversationId = data.conversationId
        if (data.tempMessageId) {
          setMessages((prev) => {
            const filtered = prev.filter(msg => msg.id !== data.tempMessageId)
            return [...filtered, messageData]
          })
          return
        }
      } else if (data.content && data.senderId) {
        messageData = {
          id: data.tempMessageId || `msg-${Date.now()}`,
          senderId: data.senderId,
          content: data.content,
          messageType: data.messageType || 'text',
          conversationId: data.conversationId,
          createdAt: data.timestamp || new Date().toISOString(),
          updatedAt: data.timestamp || new Date().toISOString(),
          isRead: false,
          isDeleted: false,
          sender: {
            id: data.senderId,
            name: 'User',
            username: 'user',
            realName: 'User',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          attachments: []
        } as Message
        msgConversationId = data.conversationId
      } else {
        return
      }
      
      if (msgConversationId === conversationId) {
        setMessages((prev) => {
          const exists = prev.some(msg => msg.id === messageData.id || 
            (msg.id.startsWith('temp-') && messageData.id.startsWith('temp-') && msg.content === messageData.content))
          if (exists) {
            return prev
          }
          return [...prev, messageData]
        })
      }
    }

    const handleTyping = (...args: unknown[]) => {
      const data = args[0] as { userId: string; conversationId: string }
      if (data.conversationId === conversationId && data.userId !== currentUser?.id) {
        setIsTyping(true)
      }
    }

    const handleStopTyping = (...args: unknown[]) => {
      const data = args[0] as { userId: string; conversationId: string }
      if (data.conversationId === conversationId && data.userId !== currentUser?.id) {
        setIsTyping(false)
        setTypingUser(null)
      }
    }

    const handleMessageSent = (...args: unknown[]) => {
      const data = args[0] as any
      if (data.tempMessageId && data.messageId) {
        setMessages((prev) => {
          return prev.map(msg => 
            msg.id === data.tempMessageId 
              ? { ...msg, id: data.messageId, confirmed: true }
              : msg
          )
        })
      }
    }

    const handleMessageError = (...args: unknown[]) => {
      const data = args[0] as any
      if (data.tempMessageId) {
        setMessages((prev) => prev.filter(msg => msg.id !== data.tempMessageId))
        toast.showError('Failed to send message', 'Error')
      }
    }

    const eventListeners = [
      { event: 'new_message', handler: handleNewMessage },
      { event: 'user_typing', handler: handleTyping },
      { event: 'user_stopped_typing', handler: handleStopTyping },
      { event: 'message_sent', handler: handleMessageSent },
      { event: 'message_error', handler: handleMessageError },
    ]

    eventListeners.forEach(({ event, handler }) => {
      socketService.on(event, handler)
    })

    return () => {
      eventListeners.forEach(({ event, handler }) => {
        socketService.off(event, handler)
      })
    }
  }, [conversationId, currentUser, toast])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Message handlers
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!newMessage.trim() || !conversationId) return

    const tempMessageId = `temp-${Date.now()}`
    const messageData = {
      conversationId: conversationId as string,
      content: newMessage,
      tempMessageId,
      messageType: 'text' as const,
    }

    // Add optimistic message
    const optimisticMessage: Message = {
      id: tempMessageId,
      senderId: currentUser?.id || '',
      content: newMessage,
      messageType: 'text',
      conversationId: conversationId as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isRead: false,
      isDeleted: false,
      sender: currentUser!,
      attachments: []
    }

    setMessages((prev) => [...prev, optimisticMessage])
    setNewMessage('')
    
    // Prefer socket; fallback to HTTP if socket is not connected
    if (socketService.isConnected()) {
      socketService.sendMessage(messageData)
      const handleMessageError = (data: any) => {
        if (data.tempMessageId === tempMessageId) {
          setMessages((prev) => prev.filter(msg => msg.id !== tempMessageId))
          toast.showError('Failed to send message', 'Error')
        }
      }
      socketService.on('message_error', handleMessageError)
      setTimeout(() => {
        socketService.off('message_error', handleMessageError)
      }, 5000)
    } else {
      try {
        const res = await chatService.sendMessage(conversationId as string, { content: newMessage, messageType: 'text' })
        if (res.success && res.data) {
          setMessages((prev) => prev.map(m => m.id === tempMessageId ? res.data : m))
        } else {
          setMessages((prev) => prev.filter(msg => msg.id !== tempMessageId))
          toast.showError('Failed to send message', 'Error')
        }
      } catch (err) {
        setMessages((prev) => prev.filter(msg => msg.id !== tempMessageId))
        toast.showError('Failed to send message', 'Error')
      }
    }
  }

  const handleTyping = () => {
    socketService.sendTyping(conversationId as string)
  }

  const handleStopTyping = () => {
    socketService.sendStopTyping(conversationId as string)
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await chatService.deleteMessage(messageId)
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between py-3 px-4 bg-white border-b shadow-sm">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="mr-3 p-1">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <Avatar className="h-10 w-10 mr-3">
            {conversation?.type === 'group' ? (
              conversation.groupAvatar ? (
                <AuthenticatedImage
                  src={conversation.groupAvatar}
                  alt={conversation.groupName || 'Group'}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-blue-200 flex items-center justify-center rounded-full">
                  <Users className="h-5 w-5 text-blue-700" />
                </div>
              )
            ) : (
              conversation?.otherParticipant?.profilePicture ? (
                <AuthenticatedImage
                  src={conversation.otherParticipant.profilePicture}
                  alt={conversation.otherParticipant.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-full">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
              )
            )}
          </Avatar>
          <div>
            <h2 className="font-semibold text-gray-900">
              {conversation?.type === 'group' 
                ? conversation.groupName 
                : (conversation?.otherParticipant?.realName || conversation?.otherParticipant?.name || 'Chat')
              }
            </h2>
            <p className="text-sm text-gray-500">
              {conversation?.type === 'group' 
                ? `${conversation.memberCount || 0} members`
                : (conversation?.otherParticipant?.isOnline ? 'Online' : 'Offline')
              }
            </p>
          </div>
        </div>
        {/* No call buttons (chat only) */}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">No messages yet</p>
              <p className="text-sm">Start a conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === currentUser?.id}
                onDelete={handleDeleteMessage}
                showSender={conversation?.type === 'group'}
              />
            ))}
            <div ref={messagesEndRef} />
            {isTyping && typingUser && (
              <TypingIndicator isTyping={isTyping} user={typingUser} />
            )}
          </>
        )}
      </div>

      {/* Message input */}
      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              // Handle file upload
              console.log('File selected:', e.target.files)
            }}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            multiple
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="p-2"
          >
            <Paperclip className="h-5 w-5 text-gray-600" />
          </Button>
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onFocus={handleTyping}
            onBlur={handleStopTyping}
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
