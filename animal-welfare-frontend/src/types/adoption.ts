import { components } from './generated/schema'

export type AdoptionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export interface AdoptionResponse {
  id: number
  animalId: number
  animalName: string
  animalCategory?: string
  primaryImageUrl?: string
  requesterId?: number
  requesterUsername: string
  status: AdoptionStatus
  message?: string
  reviewNote?: string
  reviewerUsername?: string
  createdAt: string
  reviewedAt?: string
}

export type AdoptionRequest = components['schemas']['AdoptionRequest']
export type AdoptionReviewRequest = components['schemas']['AdoptionReviewRequest']
