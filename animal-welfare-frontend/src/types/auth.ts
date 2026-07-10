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

export interface UserProfile {
  id: number
  firstName: string
  lastName: string
  username: string
  email: string
  roles: string[]
  emailVerified: boolean
  accountLocked: boolean
  createdAt: string
  animalsPosted: number
  adoptionsCompleted: number
}
