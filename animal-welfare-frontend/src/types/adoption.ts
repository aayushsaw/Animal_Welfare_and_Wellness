export type AdoptionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export interface AdoptionResponse {
  id: number
  animalId: number
  animalName: string
  animalImageUrl?: string
  requesterUsername: string
  message?: string
  status: AdoptionStatus
  reviewNote?: string
  reviewedBy?: string
  requestedAt: string
  reviewedAt?: string
}

export interface AdoptionRequest {
  message?: string
}

export interface AdoptionReviewRequest {
  decision: 'APPROVED' | 'REJECTED'
  reviewNote?: string
}
