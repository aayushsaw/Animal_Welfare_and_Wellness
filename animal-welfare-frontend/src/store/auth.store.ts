import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse, User } from '@/types/auth'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  isAuthenticated: boolean

  setAuth: (response: AuthResponse) => void
  setAccessToken: (token: string) => void
  logout: () => void
  hasRole: (role: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setAuth: (response: AuthResponse) => {
        set({
          accessToken: response.accessToken || null,
          refreshToken: response.refreshToken || null,
          user: response.username ? {
            username: response.username,
            email: response.email || '',
            roles: response.roles || [],
          } : null,
          isAuthenticated: !!response.accessToken,
        })
      },

      setAccessToken: (token: string) => {
        set({ accessToken: token })
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        })
      },

      hasRole: (role: string) => {
        const { user } = get()
        return user?.roles?.includes(role) ?? false
      },
    }),
    {
      name: 'aw-auth',
      // Only persist refresh token and user — access token is short-lived
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
