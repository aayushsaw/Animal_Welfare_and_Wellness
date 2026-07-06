import apiClient from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth'

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data)
    return res.data.data
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data)
    return res.data.data
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken })
    return res.data.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },
}
