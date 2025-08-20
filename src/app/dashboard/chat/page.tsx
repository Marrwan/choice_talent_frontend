'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { AuthenticatedImage } from '@/components/ui/authenticated-image'
import { useAuth } from '@/lib/store'
import { chatService, Conversation } from '@/services/chatService'
import { socketService, setupSocketServiceReference } from '@/services/socketService'
import { 
  MessageSquare, 
  User as UserIcon,
  Plus
} from 'lucide-react'
// Group chats removed

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  attachments?: Array<{ mimeType: string }>;
}

interface ConversationCardProps {
  conversation: Conversation
  currentUserId: string
  onClick: () => void
}

const ConversationCard: React.FC<ConversationCardProps> = ({ conversation, currentUserId, onClick }) => {
  const router = useRouter()
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const isGroup = false;
  return (
    <div onClick={onClick} className="cursor-pointer p-4 bg-white rounded-lg shadow hover:bg-gray-50 flex items-center space-x-3">
      <Avatar className="h-12 w-12 flex-shrink-0 relative">
        {
          conversation.otherParticipant.profilePicture ? (
            <AuthenticatedImage src={conversation.otherParticipant.profilePicture} alt={conversation.otherParticipant.name} className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-full">
              <UserIcon className="h-4 w-4 text-gray-400" />
            </div>
          )
        }
        {typeof conversation.otherParticipant.isOnline !== 'undefined' && (
          <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white ${conversation.otherParticipant.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
        )}
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
            {conversation.otherParticipant.realName || conversation.otherParticipant.name}
          </h3>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {conversation.lastMessage && (
              <span className="text-xs text-gray-500">{formatTime(conversation.lastMessage.createdAt)}</span>
            )}
          </div>
        </div>
        <div className="truncate text-gray-600 text-sm">
          {conversation.lastMessage ? conversation.lastMessage.content : 'No messages yet'}
        </div>
      </div>
    </div>
  );
};

export default function ConversationsPage() {
  const router = useRouter()
  const { user: currentUser, isAuthenticated } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  // Groups removed

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Set up socket service reference for auth store
    setupSocketServiceReference()

    async function fetchConversations() {
      try {
        const res = await chatService.getConversations();
        if (res.success) setConversations(res.data);
      } catch (error) {
        console.error('Error fetching conversations:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchConversations();
    
    // Groups removed
    
    // Connect to socket for real-time updates
    const token = localStorage.getItem('jobhunting_token') || localStorage.getItem('choice_talent_token')
    if (token) {
      console.log('[Chat] Connecting to socket with token')
      socketService.connect(token)
    }
  }, [isAuthenticated, router])

  // Socket.io setup for real-time updates
  useEffect(() => {
    if (!currentUser) return

    const handleNewMessage = (data: {
      message: Message;
      conversationId: string;
    }) => {
      // Show browser notification if not from current user
      if (data.message.senderId !== currentUser.id) {
        showNotification(data.message)
      }

      // Update conversation with new message
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.id === data.conversationId) {
            // Check if this message is newer than the current last message
            const currentLastMessageTime = conv.lastMessage 
              ? new Date(conv.lastMessage.createdAt).getTime() 
              : 0
            const newMessageTime = new Date(data.message.createdAt).getTime()
            
            // Only update if this message is newer
            if (newMessageTime > currentLastMessageTime) {
              return {
                ...conv,
                lastMessage: data.message,
                lastMessageAt: data.message.createdAt
              }
            }
            return conv
          }
          return conv
        })
        
        // Sort by last message time
        return updated.sort((a, b) => {
          const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
          const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
          return timeB - timeA
        })
      })
    }

    const handleMessageRead = (data: { messageId: string; readAt: string }) => {
      setConversations(prev => prev.map(conv => {
        if (conv.lastMessage && conv.lastMessage.id === data.messageId) {
          return {
            ...conv,
            lastMessage: {
              ...conv.lastMessage,
              isRead: true,
              readAt: data.readAt
            }
          }
        }
        return conv
      }))
    }

    const handleUserStatusChanged = (data: { userId: string; isOnline: boolean }) => {
      // Update conversations with online status
      setConversations(prev => prev.map(conv => ({
        ...conv,
        otherParticipant: {
          ...conv.otherParticipant,
          isOnline: data.userId === conv.otherParticipant.id ? data.isOnline : conv.otherParticipant.isOnline
        }
      })))
    }

    socketService.on('new_message', handleNewMessage)
    socketService.on('message_read', handleMessageRead)
    socketService.on('user_status_changed', handleUserStatusChanged)

    return () => {
      socketService.off('new_message', handleNewMessage)
      socketService.off('message_read', handleMessageRead)
      socketService.off('user_status_changed', handleUserStatusChanged)
    }
  }, [currentUser])

  // Browser notification function
  const showNotification = (message: {
    sender: { realName?: string; name: string; profilePicture?: string };
    content?: string;
    attachments?: Array<{ mimeType: string }>;
    conversationId: string;
  }) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const sender = message.sender.realName || message.sender.name
      const notificationContent = message.content || 
        (message.attachments && message.attachments.length > 0 ? 
          message.attachments[0].mimeType.startsWith('image/') ? '📷 Photo' : '📎 File' 
          : 'New message')

      new Notification(`${sender} sent a message`, {
        body: notificationContent,
        icon: message.sender.profilePicture || '/default-avatar.png',
        badge: '/company%20logo.png',
        tag: `chat-conversation-${message.conversationId}`,
        silent: false
      })
    }
  }

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await chatService.getConversations()
      setConversations(response.data)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConversationClick = (conversationId: string) => {
    console.group('handleConversationClick');
    console.log('Conversation ID:', conversationId);
    console.log('Router object:', router);
    
    try {
      if (!conversationId) {
        throw new Error('No conversation ID provided');
      }
      
      const path = `/dashboard/chat/${conversationId}`;
      console.log('Attempting navigation to path:', path);
      
      // Try navigation with error handling
      const navigate = async () => {
        try {
          await router.push(path);
          console.log('Navigation successful');
        } catch (error) {
          console.error('Navigation with push() failed:', error);
          try {
            await router.replace(path);
            console.log('Navigation with replace() successful');
          } catch (replaceError) {
            console.error('All navigation attempts failed:', replaceError);
            window.location.href = path; // Fallback to full page reload
          }
        }
      };
      
      navigate();
    } catch (error) {
      console.error('Error in handleConversationClick:', error);
    } finally {
      console.groupEnd();
    }
  }

  // Groups removed

  if (!isAuthenticated || !currentUser) {
    return null
  }


  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600 mt-2">
                Your conversations with other users
              </p>
            </div>
            <Link href="/dashboard/users">
              <Button className="w-full sm:w-auto h-12">
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </Link>
          </div>
        </div>

        {/* Groups removed */}

        {/* Conversations */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <MessageSquare className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No conversations yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start chatting with other users to see your conversations here
            </p>
            <Link href="/dashboard/users">
              <Button className="h-12">
                <UserIcon className="h-4 w-4 mr-2" />
                Find People to Chat With
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                currentUserId={currentUser.id}
                onClick={() => handleConversationClick(conversation.id)}
              />
            ))}
          </div>
        )}
      </div>
      {/* Groups removed */}
    </div>
  )
} 