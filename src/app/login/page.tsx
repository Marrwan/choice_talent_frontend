"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, AlertCircle, Mail } from 'lucide-react'
import { authService } from '@/services/authService'
import { ApiRequestError, tokenManager } from '@/lib/api'
import { useAuth } from '@/lib/store'
import { loginSchema, type LoginFormData } from '@/lib/validations'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isInitialized } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [needsActivation, setNeedsActivation] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isInitialized && isAuthenticated) {
      console.log('[LoginPage] User is authenticated, redirecting to career dashboard')
      router.replace('/dashboard/career')
    }
  }, [isAuthenticated, isInitialized, router])

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setNeedsActivation(false)
    setUserEmail(data.email)

    try {
      const response = await authService.login(data)
      
      // Store token and update auth state
      tokenManager.set(response.token)
      login(response.user, response.token)
      
      // Redirect to career dashboard
      console.log('[LoginPage] Login successful, redirecting to career dashboard')
      router.replace('/dashboard/career')

    } catch (error: unknown) {
      let errorMessage = 'Login failed. Please check your credentials and try again.'
      
      if (error instanceof ApiRequestError) {
        errorMessage = error.message
        
        // Check if it's an activation error
        if (errorMessage.toLowerCase().includes('activate') || 
            errorMessage.toLowerCase().includes('verification')) {
          setNeedsActivation(true)
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendActivation = async () => {
    try {
      const email = userEmail || getValues('email')
      if (!email) {
        setSubmitError('Please enter your email address first.')
        return
      }

      await authService.resendActivation(email)
      setSubmitError(null)
      setNeedsActivation(false)
      
      // Show success message
      alert('Activation email sent! Please check your inbox.')
      
    } catch (error: unknown) {
      let errorMessage = 'Failed to send activation email. Please try again.'
      
      if (error instanceof ApiRequestError) {
        errorMessage = error.message
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      setSubmitError(errorMessage)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Welcome Back
            </CardTitle>
            <CardDescription>
              Sign in to your Choice Talent account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {submitError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              {needsActivation && (
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription className="space-y-2">
                    <p>Your account needs to be activated before you can login.</p>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={handleResendActivation}
                      className="w-full"
                    >
                      Resend Activation Email
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-[#0044CC] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    {...register('password')}
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-medium text-[#0044CC] hover:underline">
                  Create one now
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 