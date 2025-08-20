import { apiClient } from '@/lib/api'

export interface User {
  id: string
  name: string
  realName: string
  username: string
  profilePicture?: string
  interests?: string
  hobbies?: string
  occupation?: string
  country?: string
  state?: string
  isOnline?: boolean
  createdAt: string
}

export interface MessageAttachment {
  id: string
  original_name: string
  fileType: string
  size: number
  fileUrl: string
  thumbnail_url?: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content?: string
  messageType: 'text' | 'image' | 'file' | 'audio' | 'video'
  isRead: boolean
  readAt?: string
  editedAt?: string
  isDeleted: boolean
  deletedAt?: string
  replyToMessageId?: string
  createdAt: string
  updatedAt: string
  sender: User
  attachments?: MessageAttachment[]
  replyToMessage?: Message
}

export interface Conversation {
  id: string;
  type?: 'direct';
  otherParticipant?: User;
  lastMessage?: Message;
  lastMessageAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages?: number
}

export interface SendMessageRequest {
  content?: string
  messageType?: 'text' | 'image' | 'file' | 'audio' | 'video'
  replyToMessageId?: string
  attachments?: FileList
}

export interface GetMessagesResponse {
  success: boolean
  data: Message[]
  pagination: PaginationMeta
}

export interface GetConversationsResponse {
  success: boolean
  data: Conversation[]
}

export interface GetUsersResponse {
  success: boolean
  data: User[]
  pagination: PaginationMeta
}

export interface SendMessageResponse {
  success: boolean
  data: Message
  message: string
}

export interface ConversationResponse {
  success: boolean
  data: Conversation
}

export interface OnlineUsersResponse {
  success: boolean
  data: User[]
}

export const chatService = {
  // Get all conversations
  async getConversations(): Promise<GetConversationsResponse> {
    const response = await apiClient.request<GetConversationsResponse>({
      method: 'GET',
      endpoint: '/chat/conversations',
      requiresAuth: true
    })
    return response
  },

  // Get or create conversation with another user
  async getOrCreateConversation(otherUserId: string): Promise<ConversationResponse> {
    const response = await apiClient.request<ConversationResponse>({
      method: 'GET',
      endpoint: `/chat/conversations/${otherUserId}`,
      requiresAuth: true
    })
    return response
  },

  // Get specific conversation
  async getConversation(conversationId: string): Promise<ConversationResponse> {
    const response = await apiClient.request<ConversationResponse>({
      method: 'GET',
      endpoint: `/chat/conversations/id/${conversationId}`,
      requiresAuth: true
    })
    return response
  },

  // Get messages for a conversation
  async getMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<GetMessagesResponse> {
    const response = await apiClient.request<GetMessagesResponse>({
      method: 'GET',
      endpoint: `/chat/conversations/${conversationId}/messages`,
      params: { page, limit },
      requiresAuth: true
    })
    return response
  },

  // Send a message
  async sendMessage(conversationId: string, messageData: SendMessageRequest): Promise<SendMessageResponse> {
    const formData = new FormData()
    
    if (messageData.content) {
      formData.append('content', messageData.content)
    }
    
    if (messageData.messageType) {
      formData.append('messageType', messageData.messageType)
    }
    
    if (messageData.replyToMessageId) {
      formData.append('replyToMessageId', messageData.replyToMessageId)
    }
    
    if (messageData.attachments) {
      Array.from(messageData.attachments).forEach((file, index) => {
        formData.append(`attachments`, file)
      })
    }

    const response = await apiClient.request<SendMessageResponse>({
      method: 'POST',
      endpoint: `/chat/conversations/${conversationId}/messages`,
      data: formData,
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
      },
      requiresAuth: true
    })
    return response
  },

  // Mark message as read
  async markMessageAsRead(messageId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.request<{ success: boolean; message: string }>({
      method: 'PUT',
      endpoint: `/chat/messages/${messageId}/read`,
      requiresAuth: true
    })
    return response
  },

  // Delete a message
  async deleteMessage(messageId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.request<{ success: boolean; message: string }>({
      method: 'DELETE',
      endpoint: `/chat/messages/${messageId}`,
      requiresAuth: true
    })
    return response
  },

  // Get online users
  async getOnlineUsers(): Promise<OnlineUsersResponse> {
    const response = await apiClient.request<OnlineUsersResponse>({
      method: 'GET',
      endpoint: '/chat/online-users',
      requiresAuth: true
    })
    return response
  },

  // Get list of users
  async getUsers(page: number = 1, limit: number = 20, search: string = ''): Promise<GetUsersResponse> {
    const response = await apiClient.request<GetUsersResponse>({
      method: 'GET',
      endpoint: '/user/list',
      params: { page, limit, search },
      requiresAuth: true
    })
    return response
  },

} 