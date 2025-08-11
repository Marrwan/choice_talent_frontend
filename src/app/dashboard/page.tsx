'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/store'
import { userService } from '@/services/userService'
import type { User } from '@/services/userService'
import { 
  User as UserIcon, 
  Settings, 
  LogOut, 
  Briefcase,
  Crown
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, updateUser } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    loadDashboardData()
  }, [isAuthenticated, router])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Load user profile
      if (user) {
        const updatedUser = await userService.getProfile()
        updateUser(updatedUser)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    logout()
    router.push('/login')
  }

  const getDisplayName = (user: User | null) => {
    return user?.realName || user?.name || 'User'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Choice Talent</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {user?.isPremium && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Premium
                  </Badge>
                )}
                <span className="text-sm text-gray-600">{getDisplayName(user)}</span>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Choice Talent</h2>
          <p className="text-lg text-gray-600">Choose your experience below</p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Career Module */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/dashboard/career">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-blue-600">Career</CardTitle>
                <CardDescription>
                  Professional development, job hunting, and career growth
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>• Professional career profiles</li>
                  <li>• Job hunting tools</li>
                  <li>• Resume builder</li>
                  <li>• Career activities tracking</li>
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Go to Career Dashboard
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <Link href="/dashboard/career/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Career Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}