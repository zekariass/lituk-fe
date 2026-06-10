import { apiClient } from './client'
import type {
  TrafficSignCategory,
  TrafficSign,
  SignsPage,
} from '@/lib/store/admin-traffic-sign-store'

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

// Category APIs
export const adminTrafficSignCategoryApi = {
  // Get all categories for a jurisdiction
  getCategories: async (jurisdictionId: number): Promise<TrafficSignCategory[]> => {
    const response = await apiClient.getClient().get(
      `/api/v1/admin/traffic-sign-categories/jurisdiction/${jurisdictionId}`
    )
    return response.data.data
  },

  // Create category
  createCategory: async (data: FormData): Promise<TrafficSignCategory> => {
    const response = await apiClient.getClient().post(
      '/api/v1/admin/traffic-sign-categories',
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data.data
  },

  // Update category
  updateCategory: async (id: number, data: FormData): Promise<TrafficSignCategory> => {
    const response = await apiClient.getClient().patch(
      `/api/v1/admin/traffic-sign-categories/${id}`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data.data
  },

  // Delete category
  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.getClient().delete(`/api/v1/admin/traffic-sign-categories/${id}`)
  },
}

// Traffic Sign APIs
export interface GetSignsParams {
  categoryId: number
  page?: number
  size?: number
  search?: string
  isActive?: boolean
  hasVideo?: boolean
  hasRealLifeAssets?: boolean
}

export const adminTrafficSignApi = {
  // Get all signs for a specific category
  getSignsByCategory: async (categoryId: number): Promise<TrafficSign[]> => {
    const response = await apiClient.getClient().get(
      `/api/v1/admin/traffic-signs/category/${categoryId}`
    )
    return response.data.data
  },

  // Get signs with pagination and filters
  getSigns: async (params: GetSignsParams): Promise<SignsPage> => {
    const response = await apiClient.getClient().get('/api/v1/admin/traffic-signs', {
      params: {
        categoryId: params.categoryId,
        page: params.page ?? 0,
        size: params.size ?? 20,
        ...(params.search && { search: params.search }),
        ...(params.isActive !== undefined && { isActive: params.isActive }),
        ...(params.hasVideo !== undefined && { hasVideo: params.hasVideo }),
        ...(params.hasRealLifeAssets !== undefined && {
          hasRealLifeAssets: params.hasRealLifeAssets,
        }),
      },
    })
    return response.data.data
  },

  // Create sign
  createSign: async (data: FormData): Promise<TrafficSign> => {
    const response = await apiClient.getClient().post('/api/v1/admin/traffic-signs', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  // Update sign
  updateSign: async (id: number, data: FormData): Promise<TrafficSign> => {
    const response = await apiClient.getClient().patch(
      `/api/v1/admin/traffic-signs/${id}`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data.data
  },

  // Delete sign
  deleteSign: async (id: number): Promise<void> => {
    await apiClient.getClient().delete(`/api/v1/admin/traffic-signs/${id}`)
  },
}

export default {
  categories: adminTrafficSignCategoryApi,
  signs: adminTrafficSignApi,
}
