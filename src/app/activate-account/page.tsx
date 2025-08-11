'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { authService } from '@/services/authService'
import { ApiRequestError } from '@/lib/api'

export default function ActivateAccountPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isActivating, setIsActivating] = useState(true)
  const [activationError, setActivationError] = useState<string | null>(null)
  const [activationSuccess, setActivationSuccess] = useState<string | null>(null)

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setActivationError('Invalid activation link. Missing token.')
      setIsActivating(false)
      return
    }

    activateAccount(token)
  }, [token])

  const activateAccount = async (activationToken: string) => {
    setIsActivating(true)
    setActivationError(null)
    setActivationSuccess(null)

    try {
      const response = await authService.activateAccount(activationToken)
      setActivationSuccess(response.message || 'Account activated successfully!')
    } catch (error: unknown) {
      let errorMessage = 'Account activation failed. Please try again or request a new activation link.'
      
      if (error instanceof ApiRequestError) {
        errorMessage = error.message
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      setActivationError(errorMessage)
    } finally {
      setIsActivating(false)
    }
  }

  const handleResendActivation = async () => {
    // This would require the user's email - for now, redirect to a resend page
    router.push('/resend-activation')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            {isActivating ? (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Activating Account
                </CardTitle>
                <CardDescription>
                  Please wait while we activate your account...
                </CardDescription>
              </>
            ) : activationSuccess ? (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Congratulations!!!
                </CardTitle>
                <CardDescription>
                  Your account is now active.
                </CardDescription>
              </>
            ) : (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Activation Failed
                </CardTitle>
                <CardDescription>
                  We couldn&apos;t activate your account
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {isActivating && (
              <div className="text-center">
                <p className="text-gray-600">
                  Activating your account, please wait...
                </p>
              </div>
            )}

            {activationSuccess && (
              <>
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription className="text-center">
                    {activationSuccess}
                  </AlertDescription>
                </Alert>
                
                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-600">
                   You can now login to your account and start using MyJobHunting.
                  </p>
                  
                  <Button asChild className="w-full">
                    <Link href="/login">
                      Continue to Login
                    </Link>
                  </Button>
                </div>
              </>
            )}

            {activationError && (
              <>
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    {activationError}
                  </AlertDescription>
                </Alert>
                
                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-600">
                    The activation link may have expired or is invalid.
                  </p>
                  
                  <div className="space-y-2">
                    <Button 
                      onClick={handleResendActivation}
                      className="w-full"
                    >
                      Request New Activation Link
                    </Button>
                    
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/login">
                        Back to Login
                      </Link>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 