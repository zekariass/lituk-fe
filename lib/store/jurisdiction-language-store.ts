import { create } from 'zustand';
import { JurisdictionLanguage, ApiResponse } from '@/lib/types';
import { AdminJurisdictionLanguage } from '@/lib/types/admin';
import api from '@/lib/api/client';

interface JurisdictionLanguageState {
  languages: JurisdictionLanguage[];
  adminLanguages: AdminJurisdictionLanguage[];
  selectedLanguageIds: number[];
  isLoading: boolean;
  error: string | null;
  
  fetchJurisdictionLanguages: (jurisdictionId: number) => Promise<void>;
  fetchAdminJurisdictionLanguages: (jurisdictionId: number) => Promise<void>;
  toggleLanguageSelection: (languageId: number) => void;
  setSelectedLanguageIds: (languageIds: number[]) => void;
  reset: () => void;
}

export const useJurisdictionLanguageStore = create<JurisdictionLanguageState>((set, get) => ({
  languages: [],
  adminLanguages: [],
  selectedLanguageIds: [],
  isLoading: false,
  error: null,

  fetchJurisdictionLanguages: async (jurisdictionId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ApiResponse<JurisdictionLanguage[]>>(
        `/api/v1/jurisdictions/${jurisdictionId}/languages`
      );
      const languages = response.data.data;
      set({ languages, isLoading: false });
      
      // Auto-select all languages by default
      const allLanguageIds = languages.map(lang => lang.id);
      set({ selectedLanguageIds: allLanguageIds });
    } catch (error: any) {
      console.error('Failed to fetch jurisdiction languages:', error);
      set({ 
        languages: [], 
        isLoading: false, 
        error: error.response?.data?.message || error.message || 'Failed to fetch languages' 
      });
    }
  },

  fetchAdminJurisdictionLanguages: async (jurisdictionId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ApiResponse<AdminJurisdictionLanguage[]>>(
        `/api/v1/admin/jurisdiction-languages/jurisdiction/${jurisdictionId}/list`
      );
      const adminLanguages = response.data.data;
      set({ adminLanguages, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch admin jurisdiction languages:', error);
      set({
        adminLanguages: [],
        isLoading: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch jurisdiction languages'
      });
    }
  },

  toggleLanguageSelection: (languageId: number) => {
    const { selectedLanguageIds, languages } = get();
    const language = languages.find(lang => lang.id === languageId);
    
    // Prevent deselecting primary language
    if (language?.isPrimary && selectedLanguageIds.includes(languageId)) {
      return;
    }
    
    set({
      selectedLanguageIds: selectedLanguageIds.includes(languageId)
        ? selectedLanguageIds.filter(id => id !== languageId)
        : [...selectedLanguageIds, languageId]
    });
  },

  setSelectedLanguageIds: (languageIds: number[]) => {
    set({ selectedLanguageIds: languageIds });
  },

  reset: () => {
    set({ 
      languages: [], 
      adminLanguages: [],
      selectedLanguageIds: [], 
      isLoading: false, 
      error: null 
    });
  },
}));
