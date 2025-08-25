'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
  showText?: boolean;
}

export function BackButton({ 
  fallbackPath = '/dashboard', 
  className = '',
  showText = true 
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // Check if there's a previous page in the history
    if (window.history.length > 1) {
      router.back();
    } else {
      // If no previous page, go to fallback path
      router.push(fallbackPath);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={`flex items-center space-x-1 text-gray-600 hover:text-gray-900 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {showText && <span className="hidden sm:inline">Back</span>}
    </Button>
  );
}
