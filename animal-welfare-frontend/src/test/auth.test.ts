import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/store/auth.store'

describe('Auth Zustand Store', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useAuthStore.getState().logout()
  })

  it('should initialize with default unauthenticated state', () => {
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.user).toBeNull()
  })

  it('should authenticate user on setAuth', () => {
    const authResponse = {
      accessToken: 'access-123',
      refreshToken: 'refresh-123',
      username: 'johndoe',
      email: 'john@example.com',
      roles: ['ROLE_USER'],
    }

    useAuthStore.getState().setAuth(authResponse)

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.accessToken).toBe('access-123')
    expect(state.refreshToken).toBe('refresh-123')
    expect(state.user).toEqual({
      username: 'johndoe',
      email: 'john@example.com',
      roles: ['ROLE_USER'],
    })
  })

  it('should verify roles correctly using hasRole', () => {
    const authResponse = {
      accessToken: 'access-123',
      refreshToken: 'refresh-123',
      username: 'adminuser',
      email: 'admin@example.com',
      roles: ['ROLE_USER', 'ROLE_ADMIN'],
    }

    useAuthStore.getState().setAuth(authResponse)

    expect(useAuthStore.getState().hasRole('ROLE_ADMIN')).toBe(true)
    expect(useAuthStore.getState().hasRole('ROLE_USER')).toBe(true)
    expect(useAuthStore.getState().hasRole('ROLE_VOLUNTEER')).toBe(false)
  })

  it('should clear authentication on logout', () => {
    useAuthStore.getState().setAuth({
      accessToken: 'access-123',
      refreshToken: 'refresh-123',
      username: 'johndoe',
      email: 'john@example.com',
      roles: ['ROLE_USER'],
    })

    useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.accessToken).toBeNull()
    expect(state.user).toBeNull()
  })
})
