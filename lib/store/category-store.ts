import { create } from 'zustand';
import { Category, ApiResponse } from '@/lib/types';
import api from '@/lib/api/client';

interface CategoryState {
  categories: Category[];
  selectedCategory: Category | null;
  isLoading: boolean;
  error: string | null;
  fetchCategories: (jurisdictionId?: number, includeStats?: boolean, licenceCategoryId?: number) => Promise<void>;
  fetchCategoryById: (id: number, licenceCategoryId?: number) => Promise<Category>;
  selectCategory: (category: Category | null) => void;
  getCategoryById: (id: number) => Category | undefined;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  selectedCategory: null,
  isLoading: false,
  error: null,

  fetchCategories: async (jurisdictionId?: number, includeStats: boolean = true, licenceCategoryId?: number) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (jurisdictionId) params.append('jurisdictionId', jurisdictionId.toString());
      if (includeStats) params.append('includeStats', 'true');
      if (licenceCategoryId) params.append('licenceCategoryId', licenceCategoryId.toString());

      const query = params.toString();
      const endpoint = query ? `/api/v1/categories?${query}` : '/api/v1/categories';

      const response = await api.get<ApiResponse<Category[]>>(endpoint);

      set({ categories: response.data.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch categories',
        isLoading: false 
      });
      throw error;
    }
  },

  fetchCategoryById: async (id: number, licenceCategoryId?: number) => {
    try {
      const params = new URLSearchParams();
      if (licenceCategoryId) params.append('licenceCategoryId', licenceCategoryId.toString());
      
      const query = params.toString();
      const endpoint = query ? `/api/v1/categories/${id}?${query}` : `/api/v1/categories/${id}`;

      const response = await api.get<ApiResponse<Category>>(endpoint);
      const updatedCategory = response.data.data;

      // Update the category in the categories array
      set((state) => ({
        categories: state.categories.map(cat => 
          cat.id === id ? updatedCategory : cat
        ),
      }));

      return updatedCategory;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch category',
      });
      throw error;
    }
  },

  selectCategory: (category: Category | null) => {
    set({ selectedCategory: category });
  },

  getCategoryById: (id: number) => {
    return get().categories.find(cat => cat.id === id);
  },
}));
