'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Home, ArrowLeft } from 'lucide-react';

interface NavigationHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  fallbackPath?: string;
  className?: string;
  children?: React.ReactNode;
}

export function NavigationHeader({
  title,
  showBackButton = true,
  showHomeButton = true,
  fallbackPath = '/dashboard',
  className = '',
  children
}: NavigationHeaderProps) {
  const router = useRouter();

  return (
    <div className={`max-w-2xl mx-auto mb-4 sm:mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {showBackButton && (
            <BackButton fallbackPath={fallbackPath} />
          )}
          {/* {title && (
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 ml-2">
              {title}
            </h1>
          )} */}
        </div>
        
        <div className="flex items-center space-x-2">
          {children}
          {showHomeButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
