"use client"

import { useEffect, useState } from 'react';
import { DashboardShell } from './dashboard-shell';
import { routing, usePathname, useRouter } from '@/i18n/routing';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store';
import { AuthHydrationProvider } from '@/components/providers/auth-hydration-provider';

interface AppLayoutProps {
  children: React.ReactNode;
}

const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/password/forgot-password', '/password/reset-password', '/privacy', '/terms', '/cookies', '/contact', '/contact/track', '/account-deletion', '/guide'];
const standaloneRoutes = ['/backoffice'];

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { refreshUser, isAuthenticated } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const localePrefixPattern = `^/(${routing.locales.join('|')})(?=/|$)`;
  const normalizedPath = pathname.replace(new RegExp(localePrefixPattern), '') || '/';
  const isPublicRoute = publicRoutes.includes(normalizedPath);
  const isStandaloneRoute = standaloneRoutes.some(route => normalizedPath.startsWith(route));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') {
      return;
    }

    if (isPublicRoute) {
      setIsSessionReady(true);
      return;
    }

    let cancelled = false;

    const validateSession = async () => {
      const hasValidSession = await apiClient.ensureSession();

      if (cancelled) {
        return;
      }

      if (!hasValidSession) {
        router.replace('/login');
        return;
      }

      // Allow UI to render with persisted user data immediately
      setIsSessionReady(true);

      // Refresh user data in background to ensure it's up-to-date
      // Don't block UI or redirect on failure
      refreshUser().catch((error) => {
        console.error('Background user refresh failed:', error);
      });
    };

    setIsSessionReady(false);
    validateSession();

    return () => {
      cancelled = true;
    };
  }, [isMounted, isPublicRoute, router, refreshUser]);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (isStandaloneRoute) {
    return <>{children}</>;
  }

  if (!isMounted) {
    return null;
  }

  if (!isSessionReady) {
    return null;
  }

  return (
    <AuthHydrationProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthHydrationProvider>
  );
}
