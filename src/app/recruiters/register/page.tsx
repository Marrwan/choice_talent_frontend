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
    setIsSubmitting(true)
    setSubmitError(null)
    setRegistrationSuccess(null)
    try {
      if (!watch('acceptTerms')) {
        setSubmitError('You must accept the Terms and Privacy Policy')
        return
      }
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
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">Create your recruiter account</CardTitle>
            <CardDescription>Hire faster with Talent Hunt and Recruitment tools</CardDescription>
          </CardHeader>
          <CardContent>
            {submitError && (
              <Alert>
                <AlertDescription className="text-center">{submitError}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Company Email</Label>
                <Input id="email" type="email" placeholder="you@company.com" {...register('email')} />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...register('password')} className="pr-12" />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={()=>setShowPassword(!showPassword)}>
                    {showPassword ? (<EyeOff className="h-4 w-4 text-gray-400" />) : (<Eye className="h-4 w-4 text-gray-400" />)}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" {...register('confirmPassword')} className="pr-12" />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={()=>setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? (<EyeOff className="h-4 w-4 text-gray-400" />) : (<Eye className="h-4 w-4 text-gray-400" />)}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" {...register('acceptTerms')} />
                <Label htmlFor="terms" className="text-sm">I agree to the <Link href="/terms" className="text-[#0044CC] underline">Terms</Link> and <Link href="/privacy" className="text-[#0044CC] underline">Privacy Policy</Link></Label>
              </div>
              <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create Recruiter Account'}
              </Button>
              <div className="text-center text-sm text-gray-600">
                Already have an account? <Link href="/login" className="text-[#0044CC] hover:underline">Sign in</Link>
              </div>
            </form>
            <div className="mt-6 text-center">
              
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


