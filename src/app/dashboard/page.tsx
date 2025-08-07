'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuth } from '@/lib/store'
import { userService } from '@/services/userService'
import { matchPreferenceService } from '@/services/matchPreferenceService'
import { datePlanService } from '@/services/datePlanService'
import type { User } from '@/services/userService'
import type { MatchPreference } from '@/services/matchPreferenceService'
import type { DatePlanStats } from '@/services/datePlanService'
import { 
  User as UserIcon, 
  Settings, 
  LogOut, 
  Heart, 
  Calendar, 
  MessageCircle,
  Star,
  CheckCircle,
  AlertCircle,
  Users,
  PlusCircle,
  Search,
  Crown
} from 'lucide-react'
import { chatService } from '@/services/chatService'
import Conversation from './Conversation';

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, updateUser } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [matchPreference, setMatchPreference] = useState<MatchPreference | null>(null)
  const [datePlanStats, setDatePlanStats] = useState<DatePlanStats | null>(null)
  const userId = user?.id || '';
  const [peerId, setPeerId] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    loadDashboardData()
  }, [isAuthenticated, router])

  useEffect(() => {
    async function fetchPeerAndConversation() {
      // Get all conversations for the user
      const convRes = await chatService.getConversations();
      if (convRes.success && convRes.data.length > 0) {
        // Pick the first conversation and peer
        setConversationId(convRes.data[0].id);
        setPeerId(convRes.data[0].otherParticipant.id);
        // Fetch messages for the conversation
        // Replace with your actual message fetching logic
        // Example:
        // const msgRes = await chatService.getMessages(convRes.data[0].id);
        // if (msgRes.success) setMessages(msgRes.data);
      }
    }
    if (userId) fetchPeerAndConversation();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Load user profile
      if (user) {
        const updatedUser = await userService.getProfile()
        updateUser(updatedUser)
        setProfileCompletion(userService.getProfileCompletionPercentage(updatedUser))
      }

      // Load match preference
      try {
        const preference = await matchPreferenceService.getMatchPreference()
        setMatchPreference(preference)
      } catch (error) {
        console.log('No match preference found')
        setMatchPreference(null)
      }

      // Load date plan stats
      try {
        const stats = await datePlanService.getDatePlanStats()
        setDatePlanStats(stats)
      } catch (error) {
        console.log('Could not load date plan stats')
        setDatePlanStats(null)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const getDisplayName = (user: User | null) => {
    if (!user) return 'User'
    if (user.realName && user.realName.trim()) return user.realName
    if (user.name && user.name.trim()) return user.name
    if (user.email && user.email.includes('@')) {
      return user.email.split('@')[0]
    }
    return 'User'
  }

  const isProfileComplete = user ? userService.isProfileComplete(user) : false

  if (!isAuthenticated || !user) {
    return null
  }

  if (isLoading) {
    return (
      <MainLayout isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout isAuthenticated={isAuthenticated} user={user || undefined} onLogout={handleLogout}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {getDisplayName(user)}!
            </h1>
            <p className="text-gray-600 mt-2">
              Your Choice Talent dashboard - manage your profile, find matches, and plan dates.
            </p>
          </div>

          {/* Profile Completion Alert */}
          {profileCompletion < 100 && (
            <div className="mb-6">
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Complete Your Profile ({profileCompletion}%)
                      </h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Complete your profile to unlock all features and improve your match potential.
                      </p>
                    </div>
                    <Link href="/dashboard/profile">
                      <Button size="sm" className="ml-4">
                        Complete Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Profile Section */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                  Profile
                </CardTitle>
                <CardDescription>
                  {isProfileComplete 
                    ? 'View and manage your complete profile' 
                    : 'Set up your profile to get started'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Profile Picture */}
                <div className="flex justify-center">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile Picture"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        // Fallback to default avatar if image fails to load
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling!.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200 ${user.profilePicture ? 'hidden' : ''}`}
                  >
                    <UserIcon className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">{getDisplayName(user)}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completion</span>
                  <span className="text-sm font-medium">{profileCompletion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{width: `${profileCompletion}%`}}
                  ></div>
                </div>
                <div className="space-y-2">
                  <Link href="/dashboard/profile" className="block">
                    <Button variant="outline" className="w-full">
                      {isProfileComplete ? 'View Profile' : 'Complete Profile'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Match Making Section */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-600" />
                  Match Making
                </CardTitle>
                <CardDescription>
                  {matchPreference 
                    ? 'Find matches based on your preferences' 
                    : 'Set your preferences to start matching'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isProfileComplete ? (
                  <div className="text-center py-4">
                    <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-3">
                      Complete your profile first to access match making
                    </p>
                    <Link href="/dashboard/profile">
                      <Button size="sm">Complete Profile</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matchPreference ? (
                      <div className="flex items-center text-green-600 mb-2">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm">Preferences set</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-500 mb-2">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm">No preferences set</span>
                      </div>
                    )}
                    <Link href="/dashboard/match-making" className="block">
                      <Button variant="outline" className="w-full">
                        {matchPreference ? 'View Matches' : 'Set Preferences'}
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Plan a Date Section */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Plan a Date
                </CardTitle>
                <CardDescription>
                  Get professional support with planning flawless dates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {datePlanStats && (
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">{datePlanStats.pending}</p>
                      <p className="text-xs text-gray-600">Pending</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{datePlanStats.completed}</p>
                      <p className="text-xs text-gray-600">Completed</p>
                    </div>
                  </div>
                )}
                <Link href="/dashboard/plan-date" className="block">
                  <Button variant="outline" className="w-full">
                    Plan New Date
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Counselling Section */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-purple-600" />
                  Counselling
                </CardTitle>
                <CardDescription>
                  Personal transformation and relationship coaching
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-2">
                  <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-3">
                    Become a better version of yourself with professional coaching
                  </p>
                </div>
                <Link href="/dashboard/counselling" className="block">
                  <Button variant="outline" className="w-full">
                    View Offers
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Job Hunting Settings Section */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-orange-600" />
                  Job Hunting Settings
                </CardTitle>
                <CardDescription>
                  Configure your job preferences and career requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-2">
                  <Search className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-3">
                    Set your job preferences, career category, and salary expectations
                  </p>
                </div>
                <Link href="/dashboard/job-hunting-settings" className="block">
                  <Button variant="outline" className="w-full">
                    Configure Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Job Subscription Section */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  Profile Forwarding
                </CardTitle>
                <CardDescription>
                  Professional job search assistance and career support
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-2">
                  <Crown className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-3">
                    Get professional support for your job search with career advisory, profile screening, and employer connections
                  </p>
                </div>
                <Link href="/dashboard/job-subscription" className="block">
                  <Button variant="outline" className="w-full">
                    View Subscriptions
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Chat Section */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  Messages
                </CardTitle>
                <CardDescription>
                  Connect and chat with other users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-2">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-3">
                    Start conversations and build meaningful connections
                  </p>
                </div>
                <div className="space-y-2">
                  <Link href="/dashboard/users" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Find People
                    </Button>
                  </Link>
                  <Link href="/dashboard/chat" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      My Conversations
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Settings Section */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  Settings
                </CardTitle>
                <CardDescription>
                  Account settings and profile management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/settings" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    Profile Settings
                  </Button>
                </Link>
                <Link href="/dashboard/change-password" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    Change Password
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quick Stats & Actions */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Account status and quick actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Account Status</span>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${user.isEmailVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <span className="text-sm">
                        {user.isEmailVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <Button 
                    onClick={handleLogout}
                    variant="outline" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversation Section */}
          <div style={{ marginTop: 32 }}>
            <h2>Conversation</h2>
            {peerId && conversationId ? (
              <Conversation userId={userId} messages={messages} />
            ) : (
              <span>No available conversation.</span>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}