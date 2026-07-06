import apiClient from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { UserProfile } from '@/types/auth'

export const usersApi = {
  getMe: async (): Promise<UserProfile> => {
    const res = await apiClient.get<ApiResponse<UserProfile>>('/users/me')
    return res.data.data
  },
}
