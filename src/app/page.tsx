'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuth } from '@/lib/store'
import { ArrowRight, FileText, Download, Users, Target, Shield, Briefcase, Award, TrendingUp } from 'lucide-react'

export default function HomePage() {
  const { isAuthenticated, user } = useAuth()

  return (
    <MainLayout isAuthenticated={isAuthenticated} user={user || undefined}>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Build Your Professional{' '}
              <span className="text-[#0044CC]">Career Profile</span>{' '}
              & Get Hired
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Create stunning professional resumes, get your profile forwarded to top employers, 
              and accelerate your career growth with our comprehensive career platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Button asChild size="lg" className="text-lg px-8">
                  <Link href="/dashboard/career">
                    Go to Career Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="text-lg px-8">
                    <Link href="/register">
                      Create Free Profile
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-lg px-8">
                    <Link href="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Career Platform?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional resume building, profile forwarding, and career guidance all in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-[#0044CC] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Professional Resume Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Create stunning professional resumes with our easy-to-use builder. 
                  Download PDF copies and stand out to employers.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-[#0044CC] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Profile Forwarding</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Get your profile forwarded directly to potential employers. 
                  Premium plans include assessment feedback and extended forwarding.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-[#0044CC] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Career Guidance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Receive expert career advice, profile assessment feedback, 
                  and job application guidance to accelerate your career.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Profile Forwarding Plans
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the plan that best fits your career goals and experience level.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">FREE BASIC</CardTitle>
                <CardDescription className="text-lg">Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-500" />
                    <span>Update your profile anytime</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-500" />
                    <span>Appear on profile search</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="relative border-2 border-[#0044CC]">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#0044CC] text-white px-4 py-1 rounded-full text-sm font-medium">
                  RECOMMENDED
                </span>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">PREMIUM</CardTitle>
                <CardDescription className="text-lg">For serious career growth</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-500" />
                    <span>Update your profile anytime</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-500" />
                    <span>Free profile download</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-500" />
                    <span>Appear on profile search</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-500" />
                    <span>Profile assessment feedback</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-500" />
                    <span>Profile forwarding to employers (3 months)</span>
                  </li>
                </ul>
                {isAuthenticated ? (
                  <Button asChild className="w-full">
                    <Link href="/dashboard/job-subscription">
                      Get Premium
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link href="/register">
                      Get Started
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Subscription Packages Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Subscription Packages
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the package that matches your experience level and career goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 0-2 years */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl">0-2 Years Experience</CardTitle>
                <div className="text-3xl font-bold text-[#0044CC]">₦3,000</div>
                <CardDescription>6 Months Duration</CardDescription>
              </CardHeader>
              <CardContent>
                {isAuthenticated ? (
                  <Button asChild className="w-full">
                    <Link href="/dashboard/job-subscription">Order Now</Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link href="/register">Get Started</Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* 3-5 years */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl">3-5 Years Experience</CardTitle>
                <div className="text-3xl font-bold text-[#0044CC]">₦5,000</div>
                <CardDescription>6 Months Duration</CardDescription>
              </CardHeader>
              <CardContent>
                {isAuthenticated ? (
                  <Button asChild className="w-full">
                    <Link href="/dashboard/job-subscription">Order Now</Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link href="/register">Get Started</Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* 6-7 years */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl">6-7 Years Experience</CardTitle>
                <div className="text-3xl font-bold text-[#0044CC]">₦7,000</div>
                <CardDescription>6 Months Duration</CardDescription>
              </CardHeader>
              <CardContent>
                {isAuthenticated ? (
                  <Button asChild className="w-full">
                    <Link href="/dashboard/job-subscription">Order Now</Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link href="/register">Get Started</Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* 10+ years */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl">10+ Years Experience</CardTitle>
                <div className="text-3xl font-bold text-[#0044CC]">₦10,000</div>
                <CardDescription>6 Months Duration</CardDescription>
              </CardHeader>
              <CardContent>
                {isAuthenticated ? (
                  <Button asChild className="w-full">
                    <Link href="/dashboard/job-subscription">Order Now</Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link href="/register">Get Started</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#0044CC] mb-2">5,000+</div>
              <div className="text-lg text-gray-600">Profiles Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#0044CC] mb-2">2,000+</div>
              <div className="text-lg text-gray-600">Successful Placements</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#0044CC] mb-2">98%</div>
              <div className="text-lg text-gray-600">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#0044CC]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build Your Professional Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who trust our platform to advance their careers.
          </p>
          {!isAuthenticated && (
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link href="/register">
                Start Building Your Profile
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </section>
    </MainLayout>
  )
}
