import apiClient from '@/lib/axios'
import type { ApiResponse, PagedResponse } from '@/types/api'
import type { AdoptionResponse, AdoptionReviewRequest } from '@/types/adoption'

export const adoptionsApi = {
  getMy: async (): Promise<AdoptionResponse[]> => {
    const res = await apiClient.get<ApiResponse<AdoptionResponse[]>>('/adoptions/my')
    return res.data.data
  },

  cancel: async (id: number): Promise<void> => {
    await apiClient.delete(`/adoptions/${id}/cancel`)
  },

  getAll: async (params?: {
    status?: string
    page?: number
    size?: number
  }): Promise<PagedResponse<AdoptionResponse>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<AdoptionResponse>>>('/adoptions', {
      params: { page: 0, size: 20, ...params },
    })
    return res.data.data
  },

  review: async (id: number, data: AdoptionReviewRequest): Promise<AdoptionResponse> => {
    const res = await apiClient.put<ApiResponse<AdoptionResponse>>(
      `/adoptions/${id}/review`,
      data
    )
    return res.data.data
  },
}
