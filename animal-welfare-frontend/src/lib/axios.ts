import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/auth.store'

const BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/v1` 
  : '/api/v1'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor: attach access token ──────────────────────────────────
apiClient.interceptors.request.use(
  async (config) => {
    let token = useAuthStore.getState().accessToken
    const refreshToken = useAuthStore.getState().refreshToken

    // Proactively refresh the token if we have a refreshToken but no accessToken,
    // avoiding unauthenticated calls to protected routes (which would fail with 401/403)
    if (!token && refreshToken && !config.url?.endsWith('/auth/refresh') && !config.url?.endsWith('/auth/login')) {
      try {
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        })
        const newAccessToken: string = response.data.data.accessToken
        const newRefreshToken: string = response.data.data.refreshToken

        useAuthStore.getState().setAccessToken(newAccessToken)
        useAuthStore.setState({
          refreshToken: newRefreshToken,
          accessToken: newAccessToken,
        })
        token = newAccessToken
      } catch (err) {
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(err)
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: silent token refresh on 401 ────────────────────────
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
  config: AxiosRequestConfig
}> = []

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error)
    } else {
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      resolve(apiClient(config))
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const store = useAuthStore.getState()
      const refreshToken = store.refreshToken

      if (!refreshToken) {
        store.logout()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        })

        const newAccessToken: string = response.data.data.accessToken
        const newRefreshToken: string = response.data.data.refreshToken

        store.setAccessToken(newAccessToken)
        // Update refresh token too (rotation)
        useAuthStore.setState({
          refreshToken: newRefreshToken,
          accessToken: newAccessToken,
        })

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        processQueue(null, newAccessToken)
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as Error)
        store.logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
