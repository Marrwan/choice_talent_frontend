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

export default function RecruiterRegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { acceptTerms: false }
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setRegistrationSuccess(null)

    try {
      const response = await authService.register({
        email: data.email,
        password: data.password,
        name: data.email.split('@')[0],
        role: 'recruiter'
      })
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
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">Recruiter Registration</CardTitle>
            <CardDescription>Create a recruiter account to access the recruiter dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {submitError && (
                <Alert variant="destructive">
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input id="email" type="email" placeholder="Enter your work email" autoComplete="email" {...register('email')} className={`h-12 ${errors.email ? 'border-red-500' : ''}`} />
                {errors.email && (<p className="text-sm text-red-600">{errors.email.message}</p>)}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Create a password" autoComplete="new-password" {...register('password')} className={`h-12 pr-12 ${errors.password ? 'border-red-500' : ''}`} />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>
                {errors.password && (<p className="text-sm text-red-600">{errors.password.message}</p>)}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm your password" autoComplete="new-password" {...register('confirmPassword')} className={`h-12 pr-12 ${errors.confirmPassword ? 'border-red-500' : ''}`} />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>
                {errors.confirmPassword && (<p className="text-sm text-red-600">{errors.confirmPassword.message}</p>)}
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox id="acceptTerms" checked={watch('acceptTerms')} onCheckedChange={(checked) => setValue('acceptTerms', Boolean(checked))} className="mt-1" />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="acceptTerms" className="text-sm font-medium leading-none">I accept the terms and conditions</label>
                </div>
              </div>
              {errors.acceptTerms && (<p className="text-sm text-red-600">{errors.acceptTerms.message}</p>)}
              <Button type="submit" className="w-full h-12" disabled={isSubmitting}>{isSubmitting ? 'Creating Account...' : 'Create Account'}</Button>
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


