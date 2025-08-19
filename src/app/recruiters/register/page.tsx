"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { authService } from '@/services/authService'
import { ApiRequestError } from '@/lib/api'
import { registerSchema, type RegisterFormData } from '@/lib/validations'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/lib/useToast'

export default function RecruiterRegisterPage() {
  // React.useEffect(() => {
  //   try {
  //     window.location.replace('/login')
  //   } catch {}
  // }, [])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null)
  const toast = useToast()

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { acceptTerms: false }
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      toast.showInfo('Recruiter registrations are temporarily disabled. Please log in.', 'Registration Disabled')
    } catch {}
    return
    // setIsSubmitting(true)
    // setSubmitError(null)
    // setRegistrationSuccess(null)
    // try {
    //   const response = await authService.register({
    //     email: data.email,
    //     password: data.password,
    //     name: data.email.split('@')[0],
    //     role: 'recruiter'
    //   })
    //   setRegistrationSuccess(response.message || 'Registration successful! Please check your email to activate your account.')
    // } catch (error: unknown) {
    //   let errorMessage = 'Registration failed. Please try again.'
    //   if (error instanceof ApiRequestError) {
    //     errorMessage = error.message
    //   } else if (error instanceof Error) {
    //     errorMessage = error.message
    //   }
    //   setSubmitError(errorMessage)
    // } finally {
    //   setIsSubmitting(false)
    // }
  }

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 sm:space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Check Your Email</CardTitle>
              <CardDescription>We have sent you an activation link</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertDescription className="text-center">{registrationSuccess}</AlertDescription>
              </Alert>
              <div className="text-center space-y-2">
                <Button asChild className="w-full h-12">
                  <Link href="/login">Go to Login</Link>
                </Button>
                <Button variant="outline" className="w-full h-12" onClick={() => setRegistrationSuccess(null)}>Register Another Account</Button>
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
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">Registration Disabled</CardTitle>
            <CardDescription>Recruiter registrations are temporarily disabled. Please log in instead.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full h-12">
              <Link href="/login">Go to Login</Link>
            </Button>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
              <Button type="submit" className="w-full h-12" variant="outline">Submit</Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account? <Link href="/login" className="font-medium text-[#0044CC] hover:underline">Sign in here</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


