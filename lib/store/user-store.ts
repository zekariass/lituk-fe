import { create } from 'zustand';
import { 
  UserJurisdiction, 
  UserSetting, 
  SubscriptionPackage,
  ApiResponse 
} from '@/lib/types';
import api from '@/lib/api/client';

interface UserState {
  jurisdictions: UserJurisdiction[];
  settings: Record<string, string>;
  subscriptionPackages: SubscriptionPackage[];
  isLoading: boolean;
  error: string | null;
  
  fetchJurisdictions: () => Promise<void>;
  addJurisdiction: (jurisdictionId: number) => Promise<void>;
  removeJurisdiction: (id: number) => Promise<void>;
  activateJurisdiction: (id: number) => Promise<void>;
  
  fetchSettings: () => Promise<void>;
  updateSetting: (name: string, value: string) => Promise<void>;
  deleteSetting: (name: string) => Promise<void>;
  
  fetchSubscriptionPackages: (jurisdictionId: number) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  jurisdictions: [],
  settings: {},
  subscriptionPackages: [],
  isLoading: false,
  error: null,

  fetchJurisdictions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ApiResponse<UserJurisdiction[]>>(
        '/api/v1/users/me/jurisdictions'
      );

      set({ 
        jurisdictions: response.data.data,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch jurisdictions',
        isLoading: false 
      });
      throw error;
    }
  },

  addJurisdiction: async (jurisdictionId: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/api/v1/users/me/jurisdictions', { jurisdictionId });
      await get().fetchJurisdictions();
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to add jurisdiction',
        isLoading: false 
      });
      throw error;
    }
  },

  removeJurisdiction: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/users/me/jurisdictions/${id}`);
      await get().fetchJurisdictions();
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to remove jurisdiction',
        isLoading: false 
      });
      throw error;
    }
  },

  activateJurisdiction: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.patch(`/api/v1/users/me/jurisdictions/${id}/activate`);
      await get().fetchJurisdictions();
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to activate jurisdiction',
        isLoading: false 
      });
      throw error;
    }
  },

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ApiResponse<UserSetting[]>>(
        '/api/v1/users/me/settings'
      );

      const settingsMap = response.data.data.reduce((acc, setting) => {
        acc[setting.name] = setting.value;
        return acc;
      }, {} as Record<string, string>);

      set({ 
        settings: settingsMap,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch settings',
        isLoading: false 
      });
      throw error;
    }
  },

  updateSetting: async (name: string, value: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/api/v1/users/me/settings/${name}`, { value });
      
      const { settings } = get();
      set({ 
        settings: { ...settings, [name]: value },
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to update setting',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteSetting: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/users/me/settings/${name}`);
      
      const { settings } = get();
      const { [name]: _, ...remainingSettings } = settings;
      set({ 
        settings: remainingSettings,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete setting',
        isLoading: false 
      });
      throw error;
    }
  },

  fetchSubscriptionPackages: async (jurisdictionId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ApiResponse<SubscriptionPackage[]>>(
        `/api/v1/jurisdictions/${jurisdictionId}/subscription-packages`
      );

      set({ 
        subscriptionPackages: response.data.data,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch subscription packages',
        isLoading: false 
      });
      throw error;
    }
  },
}));
