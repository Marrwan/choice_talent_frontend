'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuth } from '@/lib/store'
import { ArrowRight, Users, Target, Shield } from 'lucide-react'

export default function HomePage() {
  const { isAuthenticated, user } = useAuth()

  return (
    <MainLayout isAuthenticated={isAuthenticated} user={user || undefined}>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Empower Your{' '}
              <span className="text-[#0044CC]">Talent Acquisition</span>{' '}
              Journey
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Choice Talent provides innovative solutions to streamline your hiring process, 
              connect with top talent, and build exceptional teams that drive success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Button asChild size="lg" className="text-lg px-8">
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="text-lg px-8">
                    <Link href="/register">
                      Get Started Free
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
              Why Choose Choice Talent?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with human expertise 
              to revolutionize how you find and hire talent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-[#0044CC] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Smart Talent Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Our AI-powered algorithm matches you with the perfect candidates 
                  based on skills, experience, and cultural fit.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-[#0044CC] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Streamlined Process</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Reduce time-to-hire with automated screening, scheduling, 
                  and seamless collaboration tools.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-[#0044CC] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Secure & Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Enterprise-grade security with GDPR compliance ensures 
                  your data and candidates&apos; privacy are protected.
                </CardDescription>
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
              <div className="text-4xl font-bold text-[#0044CC] mb-2">10,000+</div>
              <div className="text-lg text-gray-600">Successful Hires</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#0044CC] mb-2">500+</div>
              <div className="text-lg text-gray-600">Partner Companies</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#0044CC] mb-2">95%</div>
              <div className="text-lg text-gray-600">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#0044CC]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of companies that trust Choice Talent to find their next great hire.
          </p>
          {!isAuthenticated && (
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link href="/register">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </section>
    </MainLayout>
  )
}
