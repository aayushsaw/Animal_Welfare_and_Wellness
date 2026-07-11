import apiClient from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { UserProfile } from '@/types/auth'

export const usersApi = {
  getMe: async (): Promise<UserProfile> => {
    const res = await apiClient.get<ApiResponse<UserProfile>>('/users/me')
    return res.data.data
  },

  getAll: async (): Promise<UserProfile[]> => {
    const res = await apiClient.get<ApiResponse<UserProfile[]>>('/users')
    return res.data.data
  },

  suspend: async (id: number): Promise<UserProfile> => {
    const res = await apiClient.put<ApiResponse<UserProfile>>(`/users/${id}/suspend`)
    return res.data.data
  },

  activate: async (id: number): Promise<UserProfile> => {
    const res = await apiClient.put<ApiResponse<UserProfile>>(`/users/${id}/activate`)
    return res.data.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`)
  },

  deleteMe: async (): Promise<void> => {
    await apiClient.delete('/users/me')
  },
}
