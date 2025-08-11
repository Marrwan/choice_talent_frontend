'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { useAuth } from '@/lib/store'
import { chatService, User as ChatUser } from '@/services/chatService'
import { ArrowLeft, Search, MessageCircle, Users, MapPin, Briefcase, Heart, User } from 'lucide-react'

interface UserCardProps {
  user: ChatUser
  onStartChat: (userId: string) => void
}

const UserCard: React.FC<UserCardProps> = ({ user, onStartChat }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              {user.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user.name} 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-full">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </Avatar>
            {user.isOnline && (
              <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {user.realName || user.name}
              </h3>
              <p className="text-sm text-gray-600">@{user.username}</p>
            </div>
            
            <div className="space-y-1">
              {user.occupation && (
                <div className="flex items-center text-sm text-gray-600">
                  <Briefcase className="h-4 w-4 mr-2" />
                  {user.occupation}
                </div>
              )}
              
              {(user.country || user.state) && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {[user.state, user.country].filter(Boolean).join(', ')}
                </div>
              )}
            </div>
            
            {user.interests && (
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <Heart className="h-4 w-4 mr-2" />
                  <span className="font-medium">Interests:</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {user.interests}
                </p>
              </div>
            )}
            
            {user.hobbies && (
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="font-medium">Hobbies:</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {user.hobbies}
                </p>
              </div>
            )}
            
            <div className="pt-3">
              <Button 
                onClick={() => onStartChat(user.id)}
                className="w-full"
                size="sm"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function UsersPage() {
  const router = useRouter()
  const { user: currentUser, isAuthenticated } = useAuth()
  const [users, setUsers] = useState<ChatUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    fetchUsers()
  }, [isAuthenticated, router, currentPage])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        setCurrentPage(1)
        fetchUsers(1, searchQuery)
      } else {
        setCurrentPage(1)
        fetchUsers(1, '')
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const fetchUsers = async (page: number = currentPage, search: string = '') => {
    try {
      setIsSearching(true)
      const response = await chatService.getUsers(page, 12, search)
      setUsers(response.data)
      setTotalPages(response.pagination.pages || 1)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
      setIsSearching(false)
    }
  }

  const handleStartChat = async (userId: string) => {
    try {
      const response = await chatService.getOrCreateConversation(userId)
      router.push(`/dashboard/chat/${response.data.id}`)
    } catch (error) {
      console.error('Error starting chat:', error)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (!isAuthenticated || !currentUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find People</h1>
              <p className="text-gray-600 mt-2">
                Connect with other users and start conversations
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-8 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No users found' : 'No users available'}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? 'Try adjusting your search terms.' 
                : 'Check back later for new users to connect with.'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div className="mb-6 text-sm text-gray-600">
              {isSearching ? 'Searching...' : `Found ${users.length} users`}
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {users.map((user) => (
                <UserCard 
                  key={user.id} 
                  user={user} 
                  onStartChat={handleStartChat}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 