'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuth } from '@/lib/store'
import { datePlanService, type CreateDatePlanRequest, type DatePlan } from '@/services/datePlanService'
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  MapPin,
  Star,
  Eye
} from 'lucide-react'

export default function PlanDatePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [previousPlans, setPreviousPlans] = useState<DatePlan[]>([])
  const [formData, setFormData] = useState<CreateDatePlanRequest>({
    budget: '',
    expectations: '',
    plannedDate: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    loadPreviousPlans()
  }, [isAuthenticated, router])

  const loadPreviousPlans = async () => {
    try {
      setIsLoading(true)
      const result = await datePlanService.getDatePlans()
      setPreviousPlans(result.datePlans.slice(0, 5)) // Show only last 5 plans
    } catch (error) {
      console.log('No previous date plans found')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateDatePlanRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.budget.trim()) {
      setMessage('Please enter your budget for the date')
      setMessageType('error')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const result = await datePlanService.submitDatePlanRequest(formData)
      setMessage(result.message)
      setMessageType('success')
      
      // Reset form
      setFormData({
        budget: '',
        expectations: '',
        plannedDate: ''
      })
      
      // Reload previous plans
      loadPreviousPlans()
    } catch (error) {
      console.error('Error submitting date plan:', error)
      setMessage(error instanceof Error ? error.message : 'Failed to submit date plan')
      setMessageType('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'in_progress':
        return <Star className="h-4 w-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Review'
      case 'in_progress': return 'In Progress'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      default: return 'Unknown'
    }
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <MainLayout isAuthenticated={isAuthenticated} user={user} onLogout={() => {}}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-8 w-8 text-green-600" />
                  Plan a Date
                </h1>
                <p className="text-gray-600 mt-2">
                  Get professional support with planning a flawless date
                </p>
              </div>
            </div>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Date Planning Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-green-600" />
                  Request Date Planning Support
                </CardTitle>
                <CardDescription>
                  Get professional support with planning a flawless date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Section 1: Budget */}
                  <div>
                    <Label htmlFor="budget" className="text-base font-medium">
                      What&apos;s your date budget? *
                    </Label>
                    <p className="text-sm text-gray-600 mb-2">
                      Help us plan within your comfortable spending range
                    </p>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="budget"
                        type="text"
                        value={formData.budget}
                        onChange={(e) => handleInputChange('budget', e.target.value)}
                        placeholder="500k Budget"
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Example: 500k Budget, $200, ₦100,000, etc.
                    </p>
                  </div>

                  {/* Section 2: Expectations */}
                  <div>
                    <Label htmlFor="expectations" className="text-base font-medium">
                      What are your expectations?
                    </Label>
                    <p className="text-sm text-gray-600 mb-2">
                      Tell us about your ideal date experience
                    </p>
                    <Textarea
                      id="expectations"
                      value={formData.expectations}
                      onChange={(e) => handleInputChange('expectations', e.target.value)}
                      placeholder="Describe your ideal date experience, preferred activities, ambiance, location preferences, any special requirements, or things to avoid..."
                      className="min-h-[120px]"
                    />
                  </div>

                  {/* Optional: Planned Date */}
                  <div>
                    <Label htmlFor="plannedDate" className="text-base font-medium">
                      Preferred Date & Time (Optional)
                    </Label>
                    <p className="text-sm text-gray-600 mb-2">
                      When would you like to have this date?
                    </p>
                    <Input
                      id="plannedDate"
                      type="datetime-local"
                      value={formData.plannedDate}
                      onChange={(e) => handleInputChange('plannedDate', e.target.value)}
                    />
                  </div>

                  {/* Section 3: Submit */}
                  <div className="pt-4 border-t">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting Request...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Date Plan
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Previous Date Plans */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Your Date Planning History
                  </CardTitle>
                  <CardDescription>
                    Track your previous date planning requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading history...</p>
                    </div>
                  ) : previousPlans.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No date plans yet</h3>
                      <p className="text-gray-600 text-sm">
                        Submit your first date planning request to get started!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {previousPlans.map((plan) => (
                        <div 
                          key={plan.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(plan.status)}
                              <span className="font-medium text-sm">
                                {getStatusText(plan.status)}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(plan.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium">Budget: {plan.budget}</span>
                            </div>
                            
                            {plan.plannedDate && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">
                                  {new Date(plan.plannedDate).toLocaleString()}
                                </span>
                              </div>
                            )}
                            
                            {plan.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-red-600" />
                                <span className="text-sm">{plan.location}</span>
                              </div>
                            )}
                            
                            {plan.expectations && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {plan.expectations}
                              </p>
                            )}
                            
                            {plan.suggestions && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-md">
                                <h4 className="text-sm font-medium text-blue-900 mb-1">
                                  Professional Suggestions:
                                </h4>
                                <p className="text-sm text-blue-800">
                                  {plan.suggestions}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-3 pt-3 border-t flex justify-end">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {previousPlans.length >= 5 && (
                        <div className="text-center pt-4">
                          <Link href="/dashboard/plan-date/history">
                            <Button variant="outline" size="sm">
                              View All Date Plans
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Service Information */}
              <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">Professional Date Planning</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Personalized recommendations
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Budget-conscious planning
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Location suggestions
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activity recommendations
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Expert dating advice
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 