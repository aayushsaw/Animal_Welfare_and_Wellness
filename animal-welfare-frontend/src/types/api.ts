/** Matches backend ApiResponse<T> wrapper */
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

/** Matches backend PagedResponse<T> wrapper */
export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
}
