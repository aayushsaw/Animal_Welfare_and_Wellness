import { components } from './generated/schema'

export type AuthResponse = components['schemas']['AuthResponse']
export type LoginRequest = components['schemas']['LoginRequest']
export type RegisterRequest = components['schemas']['RegisterRequest']

export interface User {
  username: string
  email: string
  roles: string[]
  firstName?: string
  lastName?: string
}

export type UserProfile = components['schemas']['UserProfileResponse']
