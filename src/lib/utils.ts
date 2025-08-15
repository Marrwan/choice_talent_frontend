import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Browser detection utilities
export const browserUtils = {
  isEdge: () => {
    if (typeof window === 'undefined') return false
    return navigator.userAgent.includes('Edg') || navigator.userAgent.includes('Edge')
  },
  
  isSafari: () => {
    if (typeof window === 'undefined') return false
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  },
  
  isChrome: () => {
    if (typeof window === 'undefined') return false
    return /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent)
  },
  
  isFirefox: () => {
    if (typeof window === 'undefined') return false
    return navigator.userAgent.includes('Firefox')
  },
  
  getBrowserName: () => {
    if (typeof window === 'undefined') return 'unknown'
    if (browserUtils.isEdge()) return 'edge'
    if (browserUtils.isSafari()) return 'safari'
    if (browserUtils.isChrome()) return 'chrome'
    if (browserUtils.isFirefox()) return 'firefox'
    return 'unknown'
  },
  
  // Check if browser has localStorage issues
  hasLocalStorageIssues: () => {
    if (typeof window === 'undefined') return false
    try {
      const test = '__localStorage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return false
    } catch {
      return true
    }
  },
  
  // Get best storage method for current browser
  getBestStorage: () => {
    if (typeof window === 'undefined') return null
    
    // Edge and some browsers might have localStorage issues
    if (browserUtils.isEdge() || browserUtils.hasLocalStorageIssues()) {
      try {
        // Try sessionStorage as fallback
        if (typeof sessionStorage !== 'undefined') {
          const test = '__sessionStorage_test__'
          sessionStorage.setItem(test, test)
          sessionStorage.removeItem(test)
          return sessionStorage
        }
      } catch {
        // Fallback to memory storage (not persistent but functional)
        console.warn('Using memory storage fallback - data will not persist')
        return {
          getItem: (key: string) => (window as any).__memoryStorage?.[key] || null,
          setItem: (key: string, value: string) => {
            if (!(window as any).__memoryStorage) (window as any).__memoryStorage = {}
            ;(window as any).__memoryStorage[key] = value
          },
          removeItem: (key: string) => {
            if ((window as any).__memoryStorage) {
              delete (window as any).__memoryStorage[key]
            }
          }
        }
      }
    }
    
    return localStorage
  }
}

export function formatError(error: unknown): string {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) return String(error.message)
  if (error && typeof error === 'object' && 'error' in error) return String(error.error)
  return 'An unexpected error occurred'
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Resize image before upload to improve performance
 */
export const resizeImage = (file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw resized image
      ctx?.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create new file with resized image
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Failed to resize image'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Get full image URL with proper error handling
 */
export const getFullImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path, prepend the API base URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};
