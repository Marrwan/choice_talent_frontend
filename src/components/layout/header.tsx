'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings, Crown, AlertCircle, Briefcase, FileText } from '@/lib/icons'

interface UserData {
  id: string
  email: string
  name?: string
  isEmailVerified?: boolean
  subscriptionStatus?: 'free' | 'premium'
  isPremium?: boolean
}

interface HeaderProps {
  isAuthenticated?: boolean
  user?: UserData | null
  onLogout?: () => void
}

export function Header({ isAuthenticated = false, user, onLogout }: HeaderProps) {
  const getInitials = (email?: string, name?: string) => {
    if (!email && !name) return 'U' // Default fallback
    
    if (name && name.trim()) {
      return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    
    if (email && email.trim()) {
      return email.trim().charAt(0).toUpperCase()
    }
    
    return 'U' // Fallback
  }

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <img src="/company%20logo.png" alt="My Job Hunting" className="w-8 h-8 rounded-lg object-cover" />
            <span className="text-lg sm:text-xl font-semibold text-[#0044CC]">My Job Hunting</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-[#0044CC] text-white">
                        {getInitials(user.email, user.name)}
                      </AvatarFallback>
                    </Avatar>
                    {user.subscriptionStatus === 'premium' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Crown className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none truncate">{user.name || 'User'}</p>
                    <p className="text-xs leading-none text-gray-600 truncate">{user.email || ''}</p>
                    <div className="flex items-center mt-1">
                      {user.subscriptionStatus === 'premium' ? (
                        <div className="flex items-center text-xs text-yellow-600">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </div>
                      ) : (
                        <div className="flex items-center text-xs text-gray-500">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Free Plan
                        </div>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span>Career Dashboard</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile-forwarding" className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Profile Forwarding</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/subscription" className="cursor-pointer">
                      <Crown className="mr-2 h-4 w-4" />
                      <span>Subscription</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/professional-career-profile" className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Professional Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Career Settings</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Desktop navigation */}
                <div className="hidden md:flex items-center space-x-3">
                  <Button asChild variant="ghost" className="h-10 px-4">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild className="h-10 px-4">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </div>
                
                {/* Mobile navigation dropdown */}
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10 px-3">
                        <span className="hidden sm:inline">Menu</span>
                        <span className="sm:hidden">Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href="/login" className="cursor-pointer h-12 flex items-center">
                          Sign In
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/register" className="cursor-pointer h-12 flex items-center">
                          Get Started
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 