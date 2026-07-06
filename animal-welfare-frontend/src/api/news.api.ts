import apiClient from '@/lib/axios'
import type { ApiResponse, PagedResponse } from '@/types/api'
import type { NewsArticle } from '@/types/news'

export const newsApi = {
  getFeatured: async (): Promise<NewsArticle[]> => {
    const res = await apiClient.get<ApiResponse<NewsArticle[]>>('/news/featured')
    return res.data.data
  },

  getAll: async (params?: { page?: number; size?: number }): Promise<PagedResponse<NewsArticle>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<NewsArticle>>>('/news', {
      params: { page: 0, size: 9, ...params },
    })
    return res.data.data
  },

  getById: async (id: number): Promise<NewsArticle> => {
    const res = await apiClient.get<ApiResponse<NewsArticle>>(`/news/${id}`)
    return res.data.data
  },

  getByCategory: async (category: string): Promise<NewsArticle[]> => {
    const res = await apiClient.get<ApiResponse<NewsArticle[]>>(`/news/category/${category}`)
    return res.data.data
  },
}
