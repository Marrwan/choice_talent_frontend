'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/store'
import { userService, type UpdateProfileRequest } from '@/services/userService'
import { ArrowLeft, Save, CheckCircle, AlertCircle } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, updateUser } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    name: '',
    realName: '',
    username: '',
    interests: '',
    hobbies: '',
    loveLanguage: '',
    profilePicture: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    height: '',
    complexion: '',
    bodySize: '',
    occupation: '',
    country: '',
    state: '',
    lga: '',
    contactNumber: '',
    email: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (user) {
      setFormData({
        name: user.name || '',
        realName: user.realName || '',
        username: user.username || '',
        interests: user.interests || '',
        hobbies: user.hobbies || '',
        loveLanguage: user.loveLanguage || '',
        profilePicture: user.profilePicture || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        maritalStatus: user.maritalStatus || '',
        height: user.height || '',
        complexion: user.complexion || '',
        bodySize: user.bodySize || '',
        occupation: user.occupation || '',
        country: user.country || '',
        state: user.state || '',
        lga: user.lga || '',
        contactNumber: user.contactNumber || '',
        email: user.email || ''
      })
    }
  }, [isAuthenticated, user, router])

  const handleInputChange = (field: keyof UpdateProfileRequest, value: string) => {
    // Clear any existing error messages when user starts typing
    if (message && messageType === 'error') {
      setMessage('')
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Validate username format
  const isValidUsername = (username: string) => {
    return /^[a-zA-Z0-9]*$/.test(username)
  }

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage('')

    // Client-side validation
    const validationErrors: string[] = []
    
    if (formData.username && !isValidUsername(formData.username)) {
      validationErrors.push('Username can only contain letters and numbers')
    }
    
    if (formData.username && formData.username.length < 3) {
      validationErrors.push('Username must be at least 3 characters long')
    }
    
    if (validationErrors.length > 0) {
      setMessage(`Please fix the following issues:\n${validationErrors.map(err => `• ${err}`).join('\n')}`)
      setMessageType('error')
      setIsSaving(false)
      scrollToTop() // Scroll to top on validation error
      return
    }

    try {
      const result = await userService.updateProfile(formData)
      updateUser(result.user)
      setMessage(result.message)
      setMessageType('success')
      scrollToTop() // Scroll to top on success
    } catch (error) {
      console.error('Profile update error:', error)
      
      // Handle validation errors more gracefully
      let errorMessage = 'Failed to update profile'
      if (error instanceof Error) {
        errorMessage = error.message
        
        // If it's a validation error with multiple issues, format them better
        if (errorMessage.includes(',')) {
          // Split comma-separated errors and format as a list
          const errors = errorMessage.split(',').map(err => err.trim())
          errorMessage = `Please fix the following issues:\n${errors.map(err => `• ${err}`).join('\n')}`
        }
      }
      
      setMessage(errorMessage)
      setMessageType('error')
      scrollToTop() // Scroll to top on error
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const profileCompletion = userService.getProfileCompletionPercentage(user)

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600 mt-2">
                Complete your profile to unlock all features and improve your match potential
              </p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-sm text-gray-600">Profile Completion</p>
              <p className="text-2xl font-bold text-blue-600">{profileCompletion}%</p>
            </div>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-md flex items-start ${
            messageType === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {messageType === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            )}
            <div className="whitespace-pre-line text-sm sm:text-base">{message}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Section 1: Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Section 1: Basic Information</CardTitle>
              <CardDescription>
                Your basic profile information and interests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="realName">Real Name *</Label>
                  <Input
                    id="realName"
                    value={formData.realName}
                    onChange={(e) => handleInputChange('realName', e.target.value)}
                    placeholder="Enter your real name"
                    required
                    className="h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Choose a unique username"
                    required
                    className={`h-12 ${formData.username && !isValidUsername(formData.username) ? 'border-red-500' : ''}`}
                  />
                  {formData.username && !isValidUsername(formData.username) && (
                    <p className="text-xs text-red-500 mt-1">
                      Username can only contain letters and numbers (no spaces or special characters)
                    </p>
                  )}
                  {formData.username && isValidUsername(formData.username) && formData.username.length < 3 && (
                    <p className="text-xs text-red-500 mt-1">
                      Username must be at least 3 characters long
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="interests">Your Interests</Label>
                <Textarea
                  id="interests"
                  value={formData.interests}
                  onChange={(e) => handleInputChange('interests', e.target.value)}
                  placeholder="Tell us about your interests (e.g., reading, traveling, cooking...)"
                  className="min-h-[80px]"
                />
              </div>
              
              <div>
                <Label htmlFor="hobbies">Your Hobbies</Label>
                <Textarea
                  id="hobbies"
                  value={formData.hobbies}
                  onChange={(e) => handleInputChange('hobbies', e.target.value)}
                  placeholder="What are your hobbies? (e.g., photography, sports, music...)"
                  className="min-h-[80px]"
                />
              </div>
              
              <div>
                <Label htmlFor="loveLanguage">Your Love Language</Label>
                <Select value={formData.loveLanguage || 'not-selected'} onValueChange={(value) => handleInputChange('loveLanguage', value === 'not-selected' ? '' : value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select your love language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-selected">None selected</SelectItem>
                    <SelectItem value="words-of-affirmation">Words of Affirmation</SelectItem>
                    <SelectItem value="quality-time">Quality Time</SelectItem>
                    <SelectItem value="receiving-gifts">Receiving Gifts</SelectItem>
                    <SelectItem value="acts-of-service">Acts of Service</SelectItem>
                    <SelectItem value="physical-touch">Physical Touch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Profile Details */}
          <Card>
            <CardHeader>
              <CardTitle>Section 2: Profile Details</CardTitle>
              <CardDescription>
                Detailed information about yourself
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="profilePicture">Profile Picture URL</Label>
                <Input
                  id="profilePicture"
                  type="url"
                  value={formData.profilePicture}
                  onChange={(e) => handleInputChange('profilePicture', e.target.value)}
                  placeholder="Enter URL to your profile picture"
                  className="h-12"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender || 'not-selected'} onValueChange={(value) => handleInputChange('gender', value === 'not-selected' ? '' : value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-selected">Please select</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="maritalStatus">Marital Status *</Label>
                  <Select value={formData.maritalStatus || 'not-selected'} onValueChange={(value) => handleInputChange('maritalStatus', value === 'not-selected' ? '' : value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-selected">Please select</SelectItem>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                      <SelectItem value="separated">Separated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="height">Height *</Label>
                  <Input
                    id="height"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder="e.g., 5'8 or 173cm"
                    required
                    className="h-12"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="complexion">Complexion *</Label>
                  <Select value={formData.complexion || 'not-selected'} onValueChange={(value) => handleInputChange('complexion', value === 'not-selected' ? '' : value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select complexion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-selected">Please select</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="olive">Olive</SelectItem>
                      <SelectItem value="brown">Brown</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bodySize">Body Size *</Label>
                  <Select value={formData.bodySize || 'not-selected'} onValueChange={(value) => handleInputChange('bodySize', value === 'not-selected' ? '' : value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select body size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-selected">Please select</SelectItem>
                      <SelectItem value="slim">Slim</SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                      <SelectItem value="athletic">Athletic</SelectItem>
                      <SelectItem value="curvy">Curvy</SelectItem>
                      <SelectItem value="plus-size">Plus Size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="occupation">Occupation *</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  placeholder="Enter your profession or occupation"
                  required
                  className="h-12"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Enter country"
                    required
                    className="h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="Enter state or province"
                    required
                    className="h-12"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="lga">LGA/Local Council *</Label>
                  <Input
                    id="lga"
                    value={formData.lga}
                    onChange={(e) => handleInputChange('lga', e.target.value)}
                    placeholder="Enter LGA or local council"
                    required
                    className="h-12"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  placeholder="Your phone number (will not be displayed to other users)"
                  className="h-12"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your phone number will not be displayed to other users
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Submit */}
          <Card>
            <CardHeader>
              <CardTitle>Section 3: Update Profile</CardTitle>
              <CardDescription>
                Save your profile changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex items-center h-12"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Profile
                    </>
                  )}
                </Button>
                <Link href="/dashboard">
                  <Button type="button" variant="outline" className="h-12 w-full sm:w-auto">
                    Cancel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
} 