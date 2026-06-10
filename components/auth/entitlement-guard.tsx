"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useEntitlement } from '@/lib/hooks/use-entitlement';
import { Loader2, Lock } from 'lucide-react';
import Link from 'next/link';

interface EntitlementGuardProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export const EntitlementGuard: React.FC<EntitlementGuardProps> = ({ 
  children, 
  fallbackPath = '/practice/pricing' 
}) => {
  const { user } = useAuthStore();
  const { hasAccess, loading, error } = useEntitlement(user?.activeJurisdictionId);
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-card rounded-lg border p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Access Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.push(fallbackPath)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 font-semibold"
          >
            View Pricing
          </button>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-card rounded-lg border p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-950 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Subscription Required</h2>
          <p className="text-muted-foreground mb-6">
            You need an active subscription to access this feature.
          </p>
          <div className="space-y-3">
            <Link
              href={fallbackPath}
              className="block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 font-semibold"
            >
              View Pricing Plans
            </Link>
            <button
              onClick={() => router.back()}
              className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 font-semibold"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
