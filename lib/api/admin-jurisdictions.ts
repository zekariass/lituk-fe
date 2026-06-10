import { apiClient } from './client'

export interface JurisdictionTranslations {
  [key: string]: {
    name?: string
    [key: string]: any
  }
}

export interface Jurisdiction {
  id: number
  code: string
  name: string
  countryId: number
  countryCode: string
  countryName: string
  translations: JurisdictionTranslations
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: {
    code: string
    message: string
    details?: any
    retryAfter?: number
    requestId?: string
  }
}

export const adminJurisdictionsApi = {
  // Get all jurisdictions
  getJurisdictions: async (): Promise<Jurisdiction[]> => {
    const response = await apiClient.getClient().get<ApiResponse<Jurisdiction[]>>(
      '/api/v1/admin/jurisdictions'
    )
    return response.data.data
  },
}
