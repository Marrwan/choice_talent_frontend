"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react'
import { authService } from '@/services/authService'
import { ApiRequestError } from '@/lib/api'

export default function ActivateAccountPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isActivating, setIsActivating] = useState(true)
  const [activationSuccess, setActivationSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string>('')

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    
    if (!tokenParam) {
      setError('Invalid activation link. Please check your email for the correct link.')
      setIsActivating(false)
      return
    }
    
    setToken(tokenParam)
    activateAccount(tokenParam)
  }, [searchParams])

  const activateAccount = async (activationToken: string) => {
    try {
      await authService.activateAccount(activationToken)
      setActivationSuccess(true)
    } catch (error: unknown) {
      let errorMessage = 'Failed to activate account. Please try again.'
      
      if (error instanceof ApiRequestError) {
        errorMessage = error.message
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
    } finally {
      setIsActivating(false)
    }
  }

  const handleResendActivation = async () => {
    try {
      // This would need to be implemented in the auth service
      // For now, we'll show a message
      alert('Please check your email for the activation link.')
    } catch (error) {
      setError('Failed to resend activation email. Please try again.')
    }
  }

  if (isActivating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 sm:space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                Activating Account
              </CardTitle>
              <CardDescription>
                Please wait while we activate your account...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  This may take a few moments.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (activationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 sm:space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                Account Activated!
              </CardTitle>
              <CardDescription>
                Your account has been successfully activated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription className="text-center">
                  Your account is now active and ready to use.
                </AlertDescription>
              </Alert>
              
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  You can now sign in to your account and start using MyJobHunting.
                </p>
                
                <Button asChild className="w-full h-12">
                  <Link href="/login">
                    Sign In to Your Account
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
              Activation Failed
            </CardTitle>
            <CardDescription>
              We couldn't activate your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                The activation link may be invalid or expired. Please try requesting a new activation email.
              </p>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleResendActivation}
                  className="w-full h-12"
                >
                  Resend Activation Email
                </Button>
                
                <Button asChild variant="outline" className="w-full h-12">
                  <Link href="/login">
                    Back to Login
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 