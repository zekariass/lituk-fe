import { create } from 'zustand';
import { Country, Jurisdiction, ApiResponse } from '@/lib/types';
import api from '@/lib/api/client';

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface ComplianceState {
  countries: Country[];
  jurisdictions: Jurisdiction[];
  selectedCountry: Country | null;
  selectedJurisdiction: Jurisdiction | null;
  isLoading: boolean;
  error: string | null;
  
  fetchCountries: (activeOnly?: boolean) => Promise<void>;
  fetchJurisdictions: (countryId?: number, activeOnly?: boolean) => Promise<void>;
  selectCountry: (country: Country | null) => void;
  selectJurisdiction: (jurisdiction: Jurisdiction | null) => void;
  reset: () => void;
}

export const useComplianceStore = create<ComplianceState>((set, get) => ({
  countries: [],
  jurisdictions: [],
  selectedCountry: null,
  selectedJurisdiction: null,
  isLoading: false,
  error: null,

  fetchCountries: async (activeOnly: boolean = true) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (activeOnly) params.append('active', 'true');

      const response = await api.get<ApiResponse<Country[]>>(
        `/api/v1/countries?${params.toString()}`
      );

      set({ countries: response.data.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch countries',
        isLoading: false 
      });
      throw error;
    }
  },

  fetchJurisdictions: async (countryId?: number, activeOnly: boolean = true) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (countryId) params.append('countryId', countryId.toString());
      if (activeOnly) params.append('active', 'true');

      const response = await api.get<ApiResponse<PageResponse<Jurisdiction>>>(
        `/api/v1/jurisdictions?${params.toString()}`
      );

      set({ 
        jurisdictions: response.data.data.content,
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

  selectCountry: (country: Country | null) => {
    set({ selectedCountry: country, jurisdictions: [], selectedJurisdiction: null });
  },

  selectJurisdiction: (jurisdiction: Jurisdiction | null) => {
    set({ selectedJurisdiction: jurisdiction });
  },

  reset: () => {
    set({
      selectedCountry: null,
      selectedJurisdiction: null,
      jurisdictions: [],
      error: null,
    });
  },
}));
