"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { authService } from '@/services/authService'
import { ApiRequestError } from '@/lib/api'
import { useAuth } from '@/lib/store'
import { registerSchema, type RegisterFormData } from '@/lib/validations'
import { useToast } from '@/lib/useToast'

export default function RegisterPage() {
  const router = useRouter()
  const { isAuthenticated, isInitialized } = useAuth()
  const toast = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null)
  const [acceptTerms, setAcceptTerms] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false
    }
  })

  // Redirect if already authenticated
  React.useEffect(() => {
    // Temporarily disable public registration
    toast.showInfo('New registrations are temporarily disabled. Please log in.', 'Registration Disabled')
    router.replace('/login')
  }, [router, toast])

  React.useEffect(() => {
    if (isInitialized && isAuthenticated) {
      console.log('[RegisterPage] User is authenticated, redirecting to career dashboard')
              router.replace('/dashboard')
    }
  }, [isAuthenticated, isInitialized, router])

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setRegistrationSuccess(null)

    try {
      const response = await authService.register({
        email: data.email,
        password: data.password,
        name: data.email.split('@')[0],
        role: 'professional'
      })

      // Show success message
      setRegistrationSuccess(response.message || 'Registration successful! Please check your email to activate your account.')

    } catch (error: unknown) {
      let errorMessage = 'Registration failed. Please try again.'
      
      if (error instanceof ApiRequestError) {
        errorMessage = error.message
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // If registration was successful, show success message
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 sm:space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                Check Your Email
              </CardTitle>
              <CardDescription>
                We have sent you an activation link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription className="text-center">
                  {registrationSuccess}
                </AlertDescription>
              </Alert>
              
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Kindly check your email and click on the link to activate your account.
                </p>
                
                <div className="space-y-2">
                  <Button asChild className="w-full h-12">
                    <Link href="/login">
                      Go to Login
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full h-12"
                    onClick={() => {
                      setRegistrationSuccess(null)
                      setSubmitError(null)
                    }}
                  >
                    Register Another Account
                  </Button>
                </div>
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
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
              Registration Disabled
            </CardTitle>
            <CardDescription>
              New registrations are temporarily disabled. Please log in instead.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full h-12">
              <Link href="/login">Go to Login</Link>
            </Button>
           
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-[#0044CC] hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 