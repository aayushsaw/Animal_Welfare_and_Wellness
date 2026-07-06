export type AnimalCategory = 'DOG' | 'CAT' | 'BIRD' | 'RABBIT' | 'OTHER'
export type AnimalGender = 'MALE' | 'FEMALE' | 'UNKNOWN'
export type AnimalStatus = 'AVAILABLE' | 'PENDING' | 'ADOPTED'
export type HealthStatus = 'HEALTHY' | 'VACCINATED' | 'NEEDS_CARE' | 'INJURED' | 'RECOVERING'

export interface AnimalImage {
  id: number
  imageUrl: string
  isPrimary: boolean
}

export interface PostedByInfo {
  id: number
  username: string
  fullName: string
}

export interface AnimalResponse {
  id: number
  name: string
  category: AnimalCategory
  breed?: string
  ageMonths?: number
  gender: AnimalGender
  color?: string
  location: string
  description?: string
  healthStatus: HealthStatus
  vaccinated: boolean
  neutered: boolean
  status: AnimalStatus
  images: AnimalImage[]
  postedBy?: PostedByInfo
  createdAt: string
}

export interface AnimalRequest {
  name: string
  category: AnimalCategory
  breed?: string
  ageMonths?: number
  gender: AnimalGender
  color?: string
  location: string
  description?: string
  healthStatus: HealthStatus
  vaccinated?: boolean
  neutered?: boolean
}

export interface AnimalStats {
  total: number
  available: number
  adopted: number
  pending?: number
}
