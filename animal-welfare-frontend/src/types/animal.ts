export type AnimalCategory = 'DOG' | 'CAT' | 'BIRD' | 'RABBIT' | 'OTHER'
export type AnimalGender = 'MALE' | 'FEMALE' | 'UNKNOWN'
export type AnimalStatus = 'AVAILABLE' | 'PENDING' | 'ADOPTED'
export type HealthStatus = 'HEALTHY' | 'VACCINATED' | 'NEEDS_CARE' | 'INJURED' | 'RECOVERING'

export interface AnimalImage {
  id: number
  imageUrl: string
  isPrimary: boolean
}

export interface AnimalResponse {
  id: number
  name: string
  category: AnimalCategory
  breed?: string
  estimatedAge?: string
  gender: AnimalGender
  healthStatus: HealthStatus
  description?: string
  location: string
  status: AnimalStatus
  images: AnimalImage[]
  postedBy: string
  postedAt: string
  adoptionCount: number
}

export interface AnimalRequest {
  name: string
  category: AnimalCategory
  breed?: string
  estimatedAge?: string
  gender: AnimalGender
  healthStatus: HealthStatus
  description?: string
  location: string
}

export interface AnimalStats {
  total: number
  available: number
  adopted: number
  pending?: number
}
