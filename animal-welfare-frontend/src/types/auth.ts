export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  username: string
  email: string
  roles: string[]
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
}

export interface User {
  username: string
  email: string
  roles: string[]
  firstName?: string
  lastName?: string
}

export interface UserProfile {
  username: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
  totalListings: number
  totalAdoptions: number
  accountLocked: boolean
}
