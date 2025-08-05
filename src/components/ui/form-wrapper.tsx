import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { cn } from '@/lib/utils'

interface FormWrapperProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg'
}

export function FormWrapper({
  title,
  description,
  children,
  className,
  maxWidth = 'sm'
}: FormWrapperProps) {
  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-xl'
  }

  return (
    <div className={cn(
      'w-full mx-auto px-4',
      maxWidthClasses[maxWidth],
      className
    )}>
      <Card className="animate-slide-up">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-semibold text-gray-900">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-base text-gray-600">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  )
} 