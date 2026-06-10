import { apiClient } from './client'
import { TrafficSignCategory, TrafficSignsPage } from '@/lib/store/traffic-signs-store'

export interface GetCategoriesParams {
  jurisdictionId: number
}

export interface GetSignsParams {
  categoryId: number
  page?: number
  size?: number
}

const trafficSignsApi = {
  getCategories: async (params: GetCategoriesParams): Promise<TrafficSignCategory[]> => {
    const response = await apiClient.getClient().get(
      `/api/v1/traffic-sign-categories/jurisdiction/${params.jurisdictionId}`
    )
    return response.data.data
  },

  getSigns: async (params: GetSignsParams): Promise<TrafficSignsPage> => {
    const response = await apiClient.getClient().get(
      `/api/v1/traffic-signs/category/${params.categoryId}`,
      {
        params: {
          page: params.page ?? 0,
          size: params.size ?? 100,
        },
      }
    )
    return response.data.data
  },
}

export default trafficSignsApi
