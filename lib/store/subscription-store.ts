import { create } from 'zustand';
import api from '@/lib/api/client';
import { SubscriptionPackage, UserEntitlementStatus } from '@/lib/types';

interface SubscriptionState {
  packages: SubscriptionPackage[];
  isLoading: boolean;
  error: string | null;
  selectedPackage: SubscriptionPackage | null;
  userEntitlement: UserEntitlementStatus | null;
  isLoadingEntitlement: boolean;
  
  fetchPackages: (jurisdictionId: number) => Promise<void>;
  fetchUserEntitlement: (jurisdictionId: number) => Promise<void>;
  setSelectedPackage: (pkg: SubscriptionPackage | null) => void;
  clearError: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  packages: [],
  isLoading: false,
  error: null,
  selectedPackage: null,
  userEntitlement: null,
  isLoadingEntitlement: false,

  fetchPackages: async (jurisdictionId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/v1/jurisdictions/${jurisdictionId}/subscription-packages`);
      const data = response.data.data || response.data;
      
      console.log('Subscription packages response:', response.data);
      
      if (Array.isArray(data)) {
        set({ packages: data, isLoading: false });
      } else {
        console.warn('Unexpected subscription packages response structure:', data);
        set({ packages: [], isLoading: false });
      }
    } catch (error: any) {
      console.error('Failed to fetch subscription packages:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to load subscription packages',
        isLoading: false,
        packages: []
      });
    }
  },

  fetchUserEntitlement: async (jurisdictionId: number) => {
    set({ isLoadingEntitlement: true, error: null });
    try {
      const response = await api.get(`/api/v1/jurisdictions/${jurisdictionId}/entitlements/status`);
      console.log('[SubscriptionStore] Full entitlement API response:', response.data);
      const data = response.data.data || response.data;
      console.log('[SubscriptionStore] Extracted entitlement data:', data);
      console.log('[SubscriptionStore] entitlement object:', data.entitlement);
      console.log('[SubscriptionStore] localPriceCode:', data.entitlement?.localPriceCode);
      set({ userEntitlement: data, isLoadingEntitlement: false });
    } catch (error: any) {
      console.error('Failed to fetch user entitlement:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to load user entitlement',
        isLoadingEntitlement: false,
        userEntitlement: null
      });
    }
  },

  setSelectedPackage: (pkg) => set({ selectedPackage: pkg }),
  
  clearError: () => set({ error: null }),
}));
