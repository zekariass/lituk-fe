import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthResponse, ApiResponse } from '@/lib/types';
import { apiClient } from '@/lib/api/client';
import api from '@/lib/api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  selectedLicenceCategoryId: number | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string, jurisdictionId?: number, languageIds?: number[]) => Promise<void>;
  googleLogin: (idToken: string, jurisdictionId?: number, languageIds?: number[]) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSelectedLicenceCategoryId: (licenceCategoryId: number | null) => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      selectedLicenceCategoryId: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post<ApiResponse<AuthResponse>>('/api/v1/auth/login', {
            email,
            password,
          });

          const authData = response.data.data;
          apiClient.setTokens(authData.accessToken, authData.refreshToken);
          
          const user: User = {
            id: authData.userId,
            email: authData.email,
            fullName: authData.fullName,
            role: authData.role,
            emailVerified: authData.emailVerified,
            activeJurisdictionId: authData.activeJurisdiction?.id ?? authData.activeJurisdictionId,
            activeJurisdiction: authData.activeJurisdiction ? {
              id: authData.activeJurisdiction.id,
              code: authData.activeJurisdiction.code,
              name: authData.activeJurisdiction.name,
              countryCode: authData.activeJurisdiction.country?.code ?? '',
              country: authData.activeJurisdiction.country,
            } : undefined,
            userLanguages: authData.userLanguages,
            createdAt: new Date().toISOString(),
          };
          
          set({ user, isAuthenticated: true, isLoading: false, selectedLicenceCategoryId: null });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, fullName?: string, jurisdictionId?: number, languageIds?: number[]) => {
        set({ isLoading: true });
        try {
          const response = await api.post<ApiResponse<AuthResponse>>('/api/v1/auth/register', {
            email,
            password,
            fullName,
            jurisdictionId,
            languageIds,
          });

          const authData = response.data.data;
          apiClient.setTokens(authData.accessToken, authData.refreshToken);
          
          const user: User = {
            id: authData.userId,
            email: authData.email,
            fullName: authData.fullName,
            role: authData.role,
            emailVerified: authData.emailVerified,
            activeJurisdictionId: authData.activeJurisdiction?.id ?? authData.activeJurisdictionId,
            activeJurisdiction: authData.activeJurisdiction ? {
              id: authData.activeJurisdiction.id,
              code: authData.activeJurisdiction.code,
              name: authData.activeJurisdiction.name,
              countryCode: authData.activeJurisdiction.country?.code ?? '',
              country: authData.activeJurisdiction.country,
            } : undefined,
            userLanguages: authData.userLanguages,
            createdAt: new Date().toISOString(),
          };
          
          set({ user, isAuthenticated: true, isLoading: false, selectedLicenceCategoryId: null });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      googleLogin: async (idToken: string, jurisdictionId?: number, languageIds?: number[]) => {
        set({ isLoading: true });
        try {
          const response = await api.post<ApiResponse<AuthResponse>>('/api/v1/auth/google', {
            idToken,
            jurisdictionId,
            languageIds,
          });

          const authData = response.data.data;
          apiClient.setTokens(authData.accessToken, authData.refreshToken);
          
          const user: User = {
            id: authData.userId,
            email: authData.email,
            fullName: authData.fullName,
            role: authData.role,
            emailVerified: authData.emailVerified,
            activeJurisdictionId: authData.activeJurisdiction?.id ?? authData.activeJurisdictionId,
            activeJurisdiction: authData.activeJurisdiction ? {
              id: authData.activeJurisdiction.id,
              code: authData.activeJurisdiction.code,
              name: authData.activeJurisdiction.name,
              countryCode: authData.activeJurisdiction.country?.code ?? '',
              country: authData.activeJurisdiction.country,
            } : undefined,
            userLanguages: authData.userLanguages,
            createdAt: new Date().toISOString(),
          };
          
          set({ user, isAuthenticated: true, isLoading: false, selectedLicenceCategoryId: null });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post('/api/v1/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          apiClient.logout();
          set({ user: null, isAuthenticated: false, selectedLicenceCategoryId: null });
        }
      },

      setUser: (user: User | null) => {
        // Compute activeJurisdictionId from activeJurisdiction.id if not present
        if (user && !user.activeJurisdictionId && user.activeJurisdiction?.id) {
          user.activeJurisdictionId = user.activeJurisdiction.id;
        }
        set({ user, isAuthenticated: !!user });
      },

      setSelectedLicenceCategoryId: (licenceCategoryId: number | null) => {
        set({ selectedLicenceCategoryId: licenceCategoryId });
      },

      refreshUser: async () => {
        try {
          const response = await api.get<ApiResponse<User>>('/api/v1/users/me');
          const userData = response.data.data;
          
          // Map the response to User type
          const user: User = {
            id: userData.id,
            email: userData.email,
            fullName: userData.fullName,
            role: userData.role,
            emailVerified: userData.emailVerified,
            activeJurisdictionId: userData.activeJurisdiction?.id,
            activeJurisdiction: userData.activeJurisdiction ? {
              id: userData.activeJurisdiction.id,
              code: userData.activeJurisdiction.code,
              name: userData.activeJurisdiction.name,
              countryCode: userData.activeJurisdiction.country?.code ?? '',
              country: userData.activeJurisdiction.country,
            } : undefined,
            userLanguages: userData.userLanguages,
            subscription: userData.subscription,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
          };
          
          set({ user, isAuthenticated: true });
        } catch (error) {
          set({ user: null, isAuthenticated: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        selectedLicenceCategoryId: state.selectedLicenceCategoryId,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, if user exists but userLanguages is missing, refresh user data
        console.log('onRehydrateStorage called, user:', state?.user?.email, 'userLanguages:', state?.user?.userLanguages);
        if (state?.user && (!state.user.userLanguages || state.user.userLanguages.length === 0)) {
          console.log('Rehydrated user missing userLanguages, calling refreshUser...');
          state.refreshUser()
            .then(() => {
              console.log('refreshUser completed, userLanguages:', useAuthStore.getState().user?.userLanguages);
            })
            .catch((err) => {
              console.error('Failed to refresh user on rehydration:', err);
            });
        } else {
          console.log('User already has userLanguages, skipping refresh');
        }
      },
    }
  )
);
