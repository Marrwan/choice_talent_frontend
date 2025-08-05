import React from 'react'
import { cn } from "@/lib/utils"

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-[#0044CC]',
        sizeClasses[size],
        className
      )}
    />
  )
}

interface LoadingButtonProps {
  children: React.ReactNode
  isLoading?: boolean
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
}

export function LoadingButton({
  children,
  isLoading = false,
  disabled = false,
  className,
  type = 'button',
  onClick
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(
        'btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {isLoading && <Spinner size="sm" className="border-white border-t-transparent" />}
      {children}
    </button>
  )
} 