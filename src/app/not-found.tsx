import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-blue-100 rounded-full p-4 mb-2">
          <AlertTriangle className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404 – Page Not Found</h1>
        <p className="text-lg text-gray-600 mb-6 max-w-xl">
          Sorry, the page you’re looking for doesn’t exist or has been moved.<br />
          If you think this is a mistake, please contact support.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/">Go Home</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard/career">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}