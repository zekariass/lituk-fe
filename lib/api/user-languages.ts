import api from './client'
import { ApiResponse, UserLanguageInfo } from '@/lib/types'

interface CreateUserLanguageRequest {
  jurisdictionId: number
  languageId: number
}

interface BulkCreateUserLanguageRequest {
  jurisdictionId: number
  languageIds: number[]
}

interface PaginatedResponse<T> {
  content: T[]
  page: {
    number: number
    size: number
    totalElements: number
    totalPages: number
  }
}

export const userLanguagesApi = {
  // Create user language preference
  create: async (data: CreateUserLanguageRequest): Promise<UserLanguageInfo> => {
    const response = await api.post<ApiResponse<UserLanguageInfo>>(
      '/api/v1/user/languages',
      data
    )
    return response.data.data
  },

  // Bulk create user language preferences
  bulkCreate: async (data: BulkCreateUserLanguageRequest): Promise<UserLanguageInfo[]> => {
    const response = await api.post<ApiResponse<UserLanguageInfo[]>>(
      '/api/v1/user/languages/bulk',
      data
    )
    return response.data.data
  },

  // Get user languages (paginated)
  getAll: async (page = 0, size = 20): Promise<PaginatedResponse<UserLanguageInfo>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<UserLanguageInfo>>>(
      `/api/v1/user/languages?page=${page}&size=${size}`
    )
    return response.data.data
  },

  // Get user languages (list - no pagination)
  getList: async (): Promise<UserLanguageInfo[]> => {
    const response = await api.get<ApiResponse<UserLanguageInfo[]>>(
      '/api/v1/user/languages/list'
    )
    return response.data.data
  },

  // Get user languages by jurisdiction
  getByJurisdiction: async (jurisdictionId: number): Promise<UserLanguageInfo[]> => {
    const response = await api.get<ApiResponse<UserLanguageInfo[]>>(
      `/api/v1/user/languages/jurisdiction/${jurisdictionId}`
    )
    return response.data.data
  },

  // Get user language by ID
  getById: async (id: number): Promise<UserLanguageInfo> => {
    const response = await api.get<ApiResponse<UserLanguageInfo>>(
      `/api/v1/user/languages/${id}`
    )
    return response.data.data
  },

  // Delete user language preference
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/user/languages/${id}`)
  }
}

export default userLanguagesApi
