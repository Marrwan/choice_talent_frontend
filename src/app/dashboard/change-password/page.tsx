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
import { ArrowLeft, Save, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function ChangePasswordPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
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
      
      // Redirect to dashboard after successful password change
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
      
    } catch (error) {
      console.error('Password change error:', error)
      setMessage(error instanceof Error ? error.message : 'Failed to change password')
      setMessageType('error')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthenticated || !user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
          <p className="text-gray-600 mt-2">
            Update your password to keep your account secure
          </p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-md flex items-center ${
            messageType === 'success' 
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

        {/* Change Password Form */}
        <Card>
          <CardHeader>
            <CardTitle>Update Password</CardTitle>
            <CardDescription>
              Enter your current password and choose a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-6">
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
                    className="pr-10"
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
                    className="pr-10"
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
                    className="pr-10"
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
              
              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex items-center"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
                
                <Link href="/dashboard">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Password Security Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Use at least 8 characters with a mix of letters, numbers, and symbols
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Avoid using personal information like your name, birthday, or email
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Don&apos;t reuse passwords from other accounts
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Consider using a password manager to generate and store strong passwords
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 