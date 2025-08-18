'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/store'
import { userService } from '@/services/userService'
import { CareerLayout } from '@/components/layout/career-layout'
import { ArrowLeft, Save, CheckCircle, AlertCircle, Eye, EyeOff, Briefcase, FileText, Settings } from 'lucide-react'

export default function CareerSettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage('')

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('New passwords do not match')
      setMessageType('error')
      setIsSaving(false)
      return
    }

    if (formData.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters long')
      setMessageType('error')
      setIsSaving(false)
      return
    }

    try {
      const result = await userService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })

      setMessage(result.message)
      setMessageType('success')
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Password change error:', error)
      setMessage(error instanceof Error ? error.message : 'Failed to change password')
      setMessageType('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeactivateAccount = async () => {
    if (window.confirm('Are you sure you want to deactivate your account? This action can be reversed by contacting support.')) {
      try {
        await userService.deleteAccount()
        logout()
        router.push('/')
      } catch (error) {
        console.error('Account deactivation error:', error)
        setMessage(error instanceof Error ? error.message : 'Failed to deactivate account')
        setMessageType('error')
      }
    }
  }

  if (!isAuthenticated || !user) {
    router.push('/login')
    return null
  }

  return (
    <CareerLayout isAuthenticated={isAuthenticated} user={user} onLogout={logout}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard/career"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Career Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">
              Manage your career account settings and preferences
            </p>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-md flex items-center ${messageType === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
              {messageType === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {message}
            </div>
          )}

          <div className="space-y-8">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your basic account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-gray-900 mt-1">{user.email}</p>
                  </div>
                  <div>
                    <Label>Display Name</Label>
                    <p className="text-sm text-gray-900 mt-1">{user.name || 'Not set'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Username</Label>
                    <p className="text-sm text-gray-900 mt-1">{user.username || 'Not set'}</p>
                  </div>
                  <div>
                    <Label>Real Name</Label>
                    <p className="text-sm text-gray-900 mt-1">{user.realName || 'Not set'}</p>
                  </div>
                </div>
                <div className="pt-4">
                  <Link href="/dashboard/professional-career-profile">
                    <Button variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Edit Career Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password *</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                        placeholder="Enter your current password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password *</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        placeholder="Enter your new password"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm your new password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Changing...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Career Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Manage your career-related preferences and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Job Hunting Preferences</h4>
                    <p className="text-sm text-gray-500">Configure your job search preferences</p>
                  </div>
                  <Link href="/dashboard/job-hunting-settings">
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Professional Profile</h4>
                    <p className="text-sm text-gray-500">Update your career profile and resume</p>
                  </div>
                  <Link href="/dashboard/professional-career-profile">
                    <Button variant="outline" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Subscription</h4>
                    <p className="text-sm text-gray-500">Manage your job search subscription</p>
                  </div>
                  <Link href="/dashboard/job-subscription">
                    <Button variant="outline" size="sm">
                      <Briefcase className="mr-2 h-4 w-4" />
                      View Subscriptions
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-red-600">Deactivate Account</h4>
                      <p className="text-sm text-gray-500">
                        Deactivate your account. You can reactivate it by contacting support.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={handleDeactivateAccount}
                    >
                      Deactivate Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CareerLayout>
  )
} 