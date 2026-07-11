import { components } from './generated/schema'

export type AnimalCategory = 'DOG' | 'CAT' | 'BIRD' | 'RABBIT' | 'OTHER'
export type AnimalGender = 'MALE' | 'FEMALE' | 'UNKNOWN'
export type AnimalStatus = 'AVAILABLE' | 'PENDING_APPROVAL' | 'PENDING' | 'ADOPTED' | 'ARCHIVED'
export type HealthStatus = 'HEALTHY' | 'VACCINATED' | 'NEEDS_CARE' | 'INJURED' | 'RECOVERING'

export interface AnimalImage {
  id?: number
  imageUrl?: string
  displayOrder?: number
  primary?: boolean
}

export type PostedByInfo = components['schemas']['PostedByInfo']

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
  primaryImageUrl?: string
  images: AnimalImage[]
  postedBy?: PostedByInfo
  createdAt: string
  updatedAt?: string
}

export type AnimalRequest = components['schemas']['AnimalRequest']

export interface AnimalStats {
  total: number
  available: number
  adopted: number
  pending?: number
}
