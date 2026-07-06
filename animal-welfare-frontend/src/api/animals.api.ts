import apiClient from '@/lib/axios'
import type { ApiResponse, PagedResponse } from '@/types/api'
import type { AnimalResponse, AnimalRequest, AnimalStats } from '@/types/animal'
import type { AdoptionRequest, AdoptionResponse } from '@/types/adoption'

export const animalsApi = {
  getAll: async (params?: {
    category?: string
    page?: number
    size?: number
  }): Promise<PagedResponse<AnimalResponse>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<AnimalResponse>>>('/animals', {
      params: { page: 0, size: 12, ...params },
    })
    return res.data.data
  },

  getById: async (id: number): Promise<AnimalResponse> => {
    const res = await apiClient.get<ApiResponse<AnimalResponse>>(`/animals/${id}`)
    return res.data.data
  },

  getStats: async (): Promise<AnimalStats> => {
    const res = await apiClient.get<ApiResponse<AnimalStats>>('/animals/stats')
    return res.data.data
  },

  getMyListings: async (): Promise<AnimalResponse[]> => {
    const res = await apiClient.get<ApiResponse<AnimalResponse[]>>('/animals/my-listings')
    return res.data.data
  },

  getMyAdoptions: async (): Promise<AnimalResponse[]> => {
    const res = await apiClient.get<ApiResponse<AnimalResponse[]>>('/animals/my-adoptions')
    return res.data.data
  },

  create: async (data: AnimalRequest): Promise<AnimalResponse> => {
    const res = await apiClient.post<ApiResponse<AnimalResponse>>('/animals', data)
    return res.data.data
  },

  update: async (id: number, data: Partial<AnimalRequest>): Promise<AnimalResponse> => {
    const res = await apiClient.put<ApiResponse<AnimalResponse>>(`/animals/${id}`, data)
    return res.data.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/animals/${id}`)
  },

  uploadImage: async (id: number, file: File): Promise<AnimalResponse> => {
    const formData = new FormData()
    formData.append('image', file)
    const res = await apiClient.post<ApiResponse<AnimalResponse>>(
      `/animals/${id}/images`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return res.data.data
  },

  adopt: async (id: number, data: AdoptionRequest): Promise<AdoptionResponse> => {
    const res = await apiClient.post<ApiResponse<AdoptionResponse>>(`/animals/${id}/adopt`, data)
    return res.data.data
  },
}
