import { create } from 'zustand';
import api from '@/lib/api/client';
import { ApiResponse } from '@/lib/types';
import {
  MockTest,
  AdminQuestion,
  QuestionExplanation,
  LicenceCategory,
  AdminCategory,
  AdminJurisdiction,
  AdminCountry,
  AdminUser,
  PaginatedResponse,
  QuestionBasicResponse,
  CreateMockTestRequest,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  CreateLicenceCategoryRequest,
  UpdateLicenceCategoryRequest,
  CreateCategoryRequest,
  CreateJurisdictionRequest,
  CreateCountryRequest,
  AssignQuestionsRequest,
  AddExplanationRequest,
  AddTipRequest,
  CreateOptionRequest,
  UpdateOptionRequest,
  UpdateExplanationRequest,
  UpdateTipRequest,
} from '@/lib/types/admin';

interface AdminState {
  isLoading: boolean;
  error: string | null;

  // Mock Tests
  mockTests: PaginatedResponse<MockTest> | null;
  currentMockTest: MockTest | null;
  fetchMockTests: (params?: Record<string, any>) => Promise<void>;
  fetchMockTest: (id: number) => Promise<MockTest>;
  createMockTest: (data: CreateMockTestRequest) => Promise<MockTest>;
  updateMockTestStatus: (id: number, status: string) => Promise<MockTest>;
  deleteMockTest: (id: number) => Promise<void>;

  // Questions
  questions: PaginatedResponse<AdminQuestion> | null;
  currentQuestion: AdminQuestion | null;
  fetchQuestions: (params?: Record<string, any>) => Promise<void>;
  searchQuestionsByText: (text: string, params?: { page?: number; size?: number }) => Promise<void>;
  fetchQuestion: (id: number) => Promise<AdminQuestion>;
  createQuestion: (data: CreateQuestionRequest) => Promise<AdminQuestion>;
  updateQuestion: (id: number, data: UpdateQuestionRequest) => Promise<AdminQuestion>;
  deleteQuestion: (id: number) => Promise<void>;
  uploadQuestionImage: (id: number, file: File, imageType?: string) => Promise<AdminQuestion>;
  uploadQuestionAssets: (
    id: number,
    files: File[],
    metadata?: { assetTypes?: string[]; alts?: string[]; captions?: string[] }
  ) => Promise<AdminQuestion>;
  deleteQuestionAsset: (id: number, assetUrl: string) => Promise<void>;
  deleteQuestionImage: (id: number, imageType: string) => Promise<void>;
  addOption: (questionId: number, option: CreateOptionRequest, assetFile?: File) => Promise<AdminQuestion>;
  updateOption: (optionId: number, data: UpdateOptionRequest) => Promise<void>;
  deleteOption: (optionId: number) => Promise<void>;
  uploadOptionImage: (optionId: number, file: File) => Promise<void>;
  deleteOptionImage: (optionId: number) => Promise<void>;
  addExplanation: (questionId: number, data: AddExplanationRequest) => Promise<QuestionExplanation>;
  createExplanation: (data: AddExplanationRequest) => Promise<QuestionExplanation>;
  fetchExplanation: (explanationId: number) => Promise<QuestionExplanation>;
  fetchExplanationByQuestion: (questionId: number) => Promise<QuestionExplanation>;
  updateExplanation: (explanationId: number, data: UpdateExplanationRequest) => Promise<void>;
  deleteExplanation: (explanationId: number) => Promise<void>;
  uploadExplanationAsset: (
    explanationId: number,
    file: File,
    metadata?: { assetType?: string; alt?: string; caption?: string }
  ) => Promise<QuestionExplanation>;
  uploadExplanationAssets: (
    explanationId: number,
    files: File[],
    metadata?: { assetTypes?: string[]; alts?: string[]; captions?: string[] }
  ) => Promise<QuestionExplanation>;
  deleteExplanationAsset: (explanationId: number, assetUrl: string) => Promise<void>;
  addTip: (questionId: number, data: AddTipRequest) => Promise<void>;
  updateTip: (tipId: number, data: UpdateTipRequest) => Promise<void>;
  deleteTip: (tipId: number) => Promise<void>;
  fetchTipsByQuestion: (questionId: number) => Promise<any[]>;
  uploadTipAssets: (
    tipId: number,
    files: File[],
    metadata?: { assetTypes?: string[]; alts?: string[]; captions?: string[] }
  ) => Promise<void>;
  deleteTipAsset: (tipId: number, assetUrl: string) => Promise<void>;

  // Licence Categories
  licenceCategories: PaginatedResponse<LicenceCategory> | null;
  currentLicenceCategory: LicenceCategory | null;
  fetchLicenceCategories: (params?: Record<string, any>) => Promise<void>;
  fetchLicenceCategory: (id: number) => Promise<LicenceCategory>;
  createLicenceCategory: (data: CreateLicenceCategoryRequest) => Promise<LicenceCategory>;
  updateLicenceCategory: (id: number, data: UpdateLicenceCategoryRequest) => Promise<LicenceCategory>;
  deleteLicenceCategory: (id: number) => Promise<void>;
  assignQuestions: (data: AssignQuestionsRequest) => Promise<LicenceCategory>;
  removeQuestions: (licenceCategoryId: number, questionIds: number[]) => Promise<LicenceCategory>;
  fetchLicenceCategoryQuestions: (licenceCategoryId: number) => Promise<number[]>;
  fetchLicenceCategoryQuestionsPage: (licenceCategoryId: number, params?: Record<string, any>) => Promise<PaginatedResponse<QuestionBasicResponse>>;
  searchQuestionsForAssignment: (params: Record<string, any>) => Promise<PaginatedResponse<QuestionBasicResponse>>;
  fetchQuestionLicenceCategories: (questionId: number) => Promise<LicenceCategory[]>;

  // Categories
  categories: AdminCategory[];
  currentCategory: AdminCategory | null;
  fetchCategories: (jurisdictionId?: number) => Promise<void>;
  createCategory: (data: CreateCategoryRequest) => Promise<AdminCategory>;
  updateCategory: (id: number, data: Partial<CreateCategoryRequest>) => Promise<AdminCategory>;
  deleteCategory: (id: number) => Promise<void>;

  // Jurisdictions
  jurisdictions: AdminJurisdiction[];
  currentJurisdiction: AdminJurisdiction | null;
  fetchJurisdictions: (countryId?: number) => Promise<void>;
  createJurisdiction: (data: CreateJurisdictionRequest) => Promise<AdminJurisdiction>;
  updateJurisdiction: (id: number, data: Partial<CreateJurisdictionRequest>) => Promise<AdminJurisdiction>;
  deleteJurisdiction: (id: number) => Promise<void>;

  // Countries
  countries: AdminCountry[];
  currentCountry: AdminCountry | null;
  fetchCountries: () => Promise<void>;
  createCountry: (data: CreateCountryRequest) => Promise<AdminCountry>;
  updateCountry: (id: number, data: Partial<CreateCountryRequest>) => Promise<AdminCountry>;
  deleteCountry: (id: number) => Promise<void>;

  // Users
  users: PaginatedResponse<AdminUser> | null;
  currentUser: AdminUser | null;
  fetchUsers: (params?: Record<string, any>) => Promise<void>;
  fetchUser: (id: string) => Promise<AdminUser>;
  updateUserRole: (id: string, role: string) => Promise<AdminUser>;
  updateUserStatus: (id: string, status: string) => Promise<AdminUser>;

  clearError: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  isLoading: false,
  error: null,
  mockTests: null,
  currentMockTest: null,
  questions: null,
  currentQuestion: null,
  licenceCategories: null,
  currentLicenceCategory: null,
  categories: [],
  currentCategory: null,
  jurisdictions: [],
  currentJurisdiction: null,
  countries: [],
  currentCountry: null,
  users: null,
  currentUser: null,

  // Mock Tests
  fetchMockTests: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
      const response = await api.get<ApiResponse<PaginatedResponse<MockTest>>>(
        `/api/v1/admin/mock-tests?${queryParams}`
      );
      set({ mockTests: response.data.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch mock tests', isLoading: false });
      throw error;
    }
  },

  addExplanation: async (questionId: number, data: AddExplanationRequest) => {
    return get().createExplanation({ ...data, questionId });
  },

  fetchMockTest: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ApiResponse<MockTest>>(`/api/v1/admin/mock-tests/${id}`);
      set({ currentMockTest: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch mock test', isLoading: false });
      throw error;
    }
  },

  createMockTest: async (data: CreateMockTestRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<ApiResponse<MockTest>>('/api/v1/admin/mock-tests', data);
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create mock test', isLoading: false });
      throw error;
    }
  },

  updateMockTestStatus: async (id: number, status: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<ApiResponse<MockTest>>(
        `/api/v1/admin/mock-tests/${id}/status`,
        { status }
      );
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update mock test status', isLoading: false });
      throw error;
    }
  },

  deleteMockTest: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/admin/mock-tests/${id}`);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete mock test', isLoading: false });
      throw error;
    }
  },

  // Questions
  fetchQuestions: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
      const response = await api.get<ApiResponse<PaginatedResponse<AdminQuestion>>>(
        `/api/v1/admin/questions?${queryParams}`
      );
      set({ questions: response.data.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch questions', isLoading: false });
      throw error;
    }
  },

  searchQuestionsByText: async (text: string, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('text', text);
      if (params.page !== undefined) queryParams.append('page', String(params.page));
      if (params.size !== undefined) queryParams.append('size', String(params.size));
      const response = await api.get<ApiResponse<PaginatedResponse<AdminQuestion>>>(
        `/api/v1/admin/questions/search?${queryParams}`
      );
      set({ questions: response.data.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to search questions', isLoading: false });
      throw error;
    }
  },

  fetchQuestion: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ApiResponse<AdminQuestion>>(`/api/v1/admin/questions/${id}`);
      set({ currentQuestion: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to fetch question', isLoading: false });
      throw error;
    }
  },

  createQuestion: async (data: CreateQuestionRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<ApiResponse<AdminQuestion>>('/api/v1/admin/questions', data);
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create question', isLoading: false });
      throw error;
    }
  },

  updateQuestion: async (id: number, data: UpdateQuestionRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<ApiResponse<AdminQuestion>>(`/api/v1/admin/questions/${id}`, data);
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update question', isLoading: false });
      throw error;
    }
  },

  deleteQuestion: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/admin/questions/${id}`);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete question', isLoading: false });
      throw error;
    }
  },

  uploadQuestionImage: async (id: number, file: File, imageType = 'question_image') => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('imageType', imageType);
      const response = await api.post<ApiResponse<AdminQuestion>>(
        `/api/v1/admin/questions/${id}/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to upload image', isLoading: false });
      throw error;
    }
  },

  uploadQuestionAssets: async (id: number, files: File[], metadata = {}) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      metadata.assetTypes?.forEach((assetType) => formData.append('assetTypes', assetType));
      metadata.alts?.forEach((alt) => formData.append('alts', alt));
      metadata.captions?.forEach((caption) => formData.append('captions', caption));

      const response = await api.post<ApiResponse<AdminQuestion>>(
        `/api/v1/admin/questions/${id}/assets`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to upload assets', isLoading: false });
      throw error;
    }
  },

  deleteQuestionAsset: async (id: number, assetUrl: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/admin/questions/${id}/assets?assetUrl=${encodeURIComponent(assetUrl)}`);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete asset', isLoading: false });
      throw error;
    }
  },

  deleteQuestionImage: async (id: number, imageType: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/admin/questions/${id}/image?imageType=${imageType}`);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete image', isLoading: false });
      throw error;
    }
  },

  addOption: async (questionId: number, option: CreateOptionRequest, assetFile?: File) => {
    set({ isLoading: true, error: null });
    try {
      // Backend expects FormData with stringified translations
      const formData = new FormData();
      formData.append('text', option.text || '');
      formData.append('isCorrect', String(option.isCorrect));
      formData.append('position', String(option.position));
      
      if (option.translations) {
        formData.append('translations', JSON.stringify(option.translations));
      }
      
      if (assetFile) {
        formData.append('asset', assetFile);
      }
      
      console.log('addOption - FormData entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }
      
      const response = await api.post<ApiResponse<AdminQuestion>>(
        `/api/v1/admin/questions/${questionId}/options`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      console.error('addOption error:', error);
      set({ error: error.response?.data?.message || 'Failed to add option', isLoading: false });
      throw error;
    }
  },

  updateOption: async (optionId: number, data: UpdateOptionRequest) => {
    set({ isLoading: true, error: null });
    try {
      // Backend expects FormData with stringified translations
      const formData = new FormData();
      if (data.text !== undefined) formData.append('text', data.text);
      if (data.isCorrect !== undefined) formData.append('isCorrect', String(data.isCorrect));
      if (data.position !== undefined) formData.append('position', String(data.position));
      
      if (data.translations) {
        formData.append('translations', JSON.stringify(data.translations));
      }
      
      console.log('updateOption - FormData entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }
      
      await api.patch(`/api/v1/admin/options/${optionId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      set({ isLoading: false });
    } catch (error: any) {
      console.error('updateOption error:', error);
      set({ error: error.response?.data?.message || 'Failed to update option', isLoading: false });
      throw error;
    }
  },

  deleteOption: async (optionId: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/admin/options/${optionId}`);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete option', isLoading: false });
      throw error;
    }
  },

  uploadOptionImage: async (optionId: number, file: File) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('image', file);
      await api.post(`/api/v1/admin/options/${optionId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to upload option image', isLoading: false });
      throw error;
    }
  },

  deleteOptionImage: async (optionId: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/admin/options/${optionId}/image`);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete option image', isLoading: false });
      throw error;
    }
  },

  createExplanation: async (data: AddExplanationRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<ApiResponse<QuestionExplanation>>(`/api/v1/admin/explanations`, data);
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create explanation', isLoading: false });
      throw error;
    }
  },

  fetchExplanation: async (explanationId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ApiResponse<QuestionExplanation>>(`/api/v1/admin/explanations/${explanationId}`);
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch explanation', isLoading: false });
      throw error;
    }
  },

  fetchExplanationByQuestion: async (questionId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ApiResponse<QuestionExplanation>>(
        `/api/v1/admin/explanations/question/${questionId}`
      );
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch explanation', isLoading: false });
      throw error;
    }
  },

  updateExplanation: async (explanationId: number, data: UpdateExplanationRequest) => {
    set({ isLoading: true, error: null });
    try {
      await api.patch(`/api/v1/admin/explanations/${explanationId}`, data);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update explanation', isLoading: false });
      throw error;
    }
  },

  deleteExplanation: async (explanationId: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/admin/explanations/${explanationId}`);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete explanation', isLoading: false });
      throw error;
    }
  },

  uploadExplanationAsset: async (explanationId: number, file: File, metadata = {}) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (metadata.assetType) {
        formData.append('assetType', metadata.assetType);
      }
      if (metadata.alt) {
        formData.append('alt', metadata.alt);
      }
      if (metadata.caption) {
        formData.append('caption', metadata.caption);
      }

      const response = await api.post<ApiResponse<QuestionExplanation>>(
        `/api/v1/admin/explanations/${explanationId}/asset`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to upload explanation asset', isLoading: false });
      throw error;
    }
  },

  uploadExplanationAssets: async (explanationId: number, files: File[], metadata = {}) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      metadata.assetTypes?.forEach((assetType) => formData.append('assetTypes', assetType));
      metadata.alts?.forEach((alt) => formData.append('alts', alt));
      metadata.captions?.forEach((caption) => formData.append('captions', caption));

      const response = await api.post<ApiResponse<QuestionExplanation>>(
        `/api/v1/admin/explanations/${explanationId}/assets`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to upload explanation assets', isLoading: false });
      throw error;
    }
  },

  deleteExplanationAsset: async (explanationId: number, assetUrl: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(
        `/api/v1/admin/explanations/${explanationId}/assets?assetUrl=${encodeURIComponent(assetUrl)}`
      );
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete explanation asset', isLoading: false });
      throw error;
    }
  },

  addTip: async (questionId: number, data: AddTipRequest) => {
    set({ isLoading: true, error: null });
    try {
      console.log('addTip API call - questionId:', questionId);
      console.log('addTip API call - data:', JSON.stringify(data, null, 2));
      const response = await api.post(`/api/v1/admin/questions/${questionId}/tips`, data);
      console.log('addTip API response:', response.data);
      set({ isLoading: false });
    } catch (error: any) {
      console.error('addTip API error:', error.response?.data);
      set({ error: error.response?.data?.message || 'Failed to add tip', isLoading: false });
      throw error;
    }
  },

  updateTip: async (tipId: number, data: UpdateTipRequest) => {
    set({ isLoading: true, error: null });
    try {
      console.log('updateTip API call - tipId:', tipId);
      console.log('updateTip API call - data:', JSON.stringify(data, null, 2));
      const response = await api.patch(`/api/v1/admin/tips/${tipId}`, data);
      console.log('updateTip API response:', response.data);
      set({ isLoading: false });
    } catch (error: any) {
      console.error('updateTip API error:', error.response?.data);
      set({ error: error.response?.data?.message || 'Failed to update tip', isLoading: false });
      throw error;
    }
  },

  deleteTip: async (tipId: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/admin/tips/${tipId}`);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete tip', isLoading: false });
      throw error;
    }
  },

  fetchTipsByQuestion: async (questionId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ApiResponse<any[]>>(`/api/v1/questions/${questionId}/tips`);
      set({ isLoading: false });
      return response.data.data || [];
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch tips', isLoading: false });
      throw error;
    }
  },

  uploadTipAssets: async (tipId: number, files: File[], metadata = {}) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      metadata.assetTypes?.forEach((assetType) => formData.append('assetTypes', assetType));
      metadata.alts?.forEach((alt) => formData.append('alts', alt));
      metadata.captions?.forEach((caption) => formData.append('captions', caption));

      await api.post(
        `/api/v1/admin/tips/${tipId}/assets`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to upload tip assets', isLoading: false });
      throw error;
    }
  },

  deleteTipAsset: async (tipId: number, assetUrl: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(
        `/api/v1/admin/tips/${tipId}/assets?assetUrl=${encodeURIComponent(assetUrl)}`
      );
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete tip asset', isLoading: false });
      throw error;
    }
  },

  // Licence Categories
  fetchLicenceCategories: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
      const response = await api.get<ApiResponse<PaginatedResponse<LicenceCategory>>>(
        `/api/v1/admin/licence-categories?${queryParams}`
      );
      set({ licenceCategories: response.data.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch licence categories', isLoading: false });
      throw error;
    }
  },

  fetchLicenceCategory: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ApiResponse<LicenceCategory>>(`/api/v1/admin/licence-categories/${id}`);
      set({ currentLicenceCategory: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch licence category', isLoading: false });
      throw error;
    }
  },

  createLicenceCategory: async (data: CreateLicenceCategoryRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<ApiResponse<LicenceCategory>>('/api/v1/admin/licence-categories', data);
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create licence category', isLoading: false });
      throw error;
    }
  },

  updateLicenceCategory: async (id: number, data: UpdateLicenceCategoryRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<ApiResponse<LicenceCategory>>(
        `/api/v1/admin/licence-categories/${id}`,
        data
      );
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update licence category', isLoading: false });
      throw error;
    }
  },

  deleteLicenceCategory: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/admin/licence-categories/${id}`);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete licence category', isLoading: false });
      throw error;
    }
  },

  assignQuestions: async (data: AssignQuestionsRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<ApiResponse<LicenceCategory>>(
        '/api/v1/admin/licence-categories/assign-questions',
        data
      );
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to assign questions', isLoading: false });
      throw error;
    }
  },

  removeQuestions: async (licenceCategoryId: number, questionIds: number[]) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete<ApiResponse<LicenceCategory>>(
        `/api/v1/admin/licence-categories/${licenceCategoryId}/questions?questionIds=${questionIds.join(',')}`
      );
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to remove questions', isLoading: false });
      throw error;
    }
  },

  fetchLicenceCategoryQuestions: async (licenceCategoryId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ApiResponse<number[]>>(
        `/api/v1/admin/licence-categories/${licenceCategoryId}/questions`
      );
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch licence category questions', isLoading: false });
      throw error;
    }
  },

  fetchLicenceCategoryQuestionsPage: async (licenceCategoryId: number, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) queryParams.append(key, String(value));
      });
      const response = await api.get<ApiResponse<PaginatedResponse<QuestionBasicResponse>>>(
        `/api/v1/admin/licence-categories/${licenceCategoryId}/questions?${queryParams}`
      );
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch licence category questions', isLoading: false });
      throw error;
    }
  },

  searchQuestionsForAssignment: async (params: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') queryParams.append(key, String(value));
      });
      const response = await api.get<ApiResponse<PaginatedResponse<QuestionBasicResponse>>>(
        `/api/v1/admin/licence-categories/questions/search?${queryParams}`
      );
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to search questions', isLoading: false });
      throw error;
    }
  },

  fetchQuestionLicenceCategories: async (questionId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ApiResponse<LicenceCategory[]>>(
        `/api/v1/admin/questions/${questionId}/licence-categories`
      );
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch question licence categories', isLoading: false });
      throw error;
    }
  },

  // Categories
  fetchCategories: async (jurisdictionId?: number) => {
    set({ isLoading: true, error: null });
    try {
      const url = jurisdictionId 
        ? `/api/v1/admin/categories?jurisdictionId=${jurisdictionId}`
        : '/api/v1/admin/categories';
      const response = await api.get<ApiResponse<AdminCategory[]>>(url);
      set({ categories: response.data.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch categories', isLoading: false });
      throw error;
    }
  },

  createCategory: async (data: CreateCategoryRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<ApiResponse<AdminCategory>>('/api/v1/admin/categories', data);
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create category', isLoading: false });
      throw error;
    }
  },

  updateCategory: async (id: number, data: Partial<CreateCategoryRequest>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<ApiResponse<AdminCategory>>(`/api/v1/admin/categories/${id}`, data);
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update category', isLoading: false });
      throw error;
    }
  },

  deleteCategory: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/admin/categories/${id}`);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete category', isLoading: false });
      throw error;
    }
  },

  // Jurisdictions
  fetchJurisdictions: async (countryId?: number) => {
    set({ isLoading: true, error: null });
    try {
      const url = countryId 
        ? `/api/v1/admin/jurisdictions?countryId=${countryId}`
        : '/api/v1/admin/jurisdictions';
      const response = await api.get<ApiResponse<AdminJurisdiction[]>>(url);
      set({ jurisdictions: response.data.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch jurisdictions', isLoading: false });
      throw error;
    }
  },

  createJurisdiction: async (data: CreateJurisdictionRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<ApiResponse<AdminJurisdiction>>('/api/v1/admin/jurisdictions', data);
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create jurisdiction', isLoading: false });
      throw error;
    }
  },

  updateJurisdiction: async (id: number, data: Partial<CreateJurisdictionRequest>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<ApiResponse<AdminJurisdiction>>(`/api/v1/admin/jurisdictions/${id}`, data);
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update jurisdiction', isLoading: false });
      throw error;
    }
  },

  deleteJurisdiction: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/admin/jurisdictions/${id}`);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete jurisdiction', isLoading: false });
      throw error;
    }
  },

  // Countries
  fetchCountries: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ApiResponse<AdminCountry[]>>('/api/v1/admin/countries');
      set({ countries: response.data.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch countries', isLoading: false });
      throw error;
    }
  },

  createCountry: async (data: CreateCountryRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<ApiResponse<AdminCountry>>('/api/v1/admin/countries', data);
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create country', isLoading: false });
      throw error;
    }
  },

  updateCountry: async (id: number, data: Partial<CreateCountryRequest>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<ApiResponse<AdminCountry>>(`/api/v1/admin/countries/${id}`, data);
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update country', isLoading: false });
      throw error;
    }
  },

  deleteCountry: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/admin/countries/${id}`);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete country', isLoading: false });
      throw error;
    }
  },

  // Users
  fetchUsers: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
      const response = await api.get<ApiResponse<PaginatedResponse<AdminUser>>>(
        `/api/v1/admin/users?${queryParams}`
      );
      set({ users: response.data.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch users', isLoading: false });
      throw error;
    }
  },

  fetchUser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ApiResponse<AdminUser>>(`/api/v1/admin/users/${id}`);
      set({ currentUser: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch user', isLoading: false });
      throw error;
    }
  },

  updateUserRole: async (id: string, role: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<ApiResponse<AdminUser>>(`/api/v1/admin/users/${id}/role`, { role });
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update user role', isLoading: false });
      throw error;
    }
  },

  updateUserStatus: async (id: string, status: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<ApiResponse<AdminUser>>(`/api/v1/admin/users/${id}/status`, { status });
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update user status', isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
