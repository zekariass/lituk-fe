"use client"

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';

interface AuthHydrationProviderProps {
  children: React.ReactNode;
}

export function AuthHydrationProvider({ children }: AuthHydrationProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Wait for Zustand persist to hydrate from localStorage
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      const currentUser = useAuthStore.getState().user;
      console.log('🔄 Auth hydration complete');
      console.log('👤 User after hydration:', currentUser);
      console.log('🌍 activeJurisdictionId:', currentUser?.activeJurisdictionId);
      setIsHydrated(true);
    });

    // If already hydrated, set immediately
    if (useAuthStore.persist.hasHydrated()) {
      const currentUser = useAuthStore.getState().user;
      console.log('✅ Auth already hydrated');
      console.log('👤 User:', currentUser);
      console.log('🌍 activeJurisdictionId:', currentUser?.activeJurisdictionId);
      setIsHydrated(true);
    }

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isHydrated && user) {
      console.log('🔍 Current user state:', user);
      console.log('🔍 activeJurisdictionId:', user.activeJurisdictionId);
    }
  }, [isHydrated, user]);

  if (!isHydrated) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}
