import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format ISO date string to human readable */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Resolve an image URL from the backend — handles both full URLs (Cloudinary) and path-relative URLs */
export function resolveImageUrl(url: string | undefined | null): string {
  if (!url) return '/placeholder-animal.jpg'
  // Already absolute (Cloudinary CDN)
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  // Relative path served by Spring Boot static resources — Vite proxy handles it
  if (url.startsWith('/')) return url
  return `/${url}`
}

/** Get primary image from an array, fallback to first */
export function getPrimaryImage(images: Array<{ imageUrl: string; isPrimary: boolean }>): string {
  const primary = images.find((i) => i.isPrimary)
  return resolveImageUrl(primary?.imageUrl ?? images[0]?.imageUrl)
}

/** Animal category display name */
export const CATEGORY_LABELS: Record<string, string> = {
  DOG: 'Dog',
  CAT: 'Cat',
  BIRD: 'Bird',
  RABBIT: 'Rabbit',
  OTHER: 'Other',
}

/** Health status display with color class */
export const HEALTH_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  HEALTHY: { label: 'Healthy', className: 'bg-forest-100 text-forest-700' },
  VACCINATED: { label: 'Vaccinated', className: 'bg-sage-100 text-sage-700' },
  NEEDS_CARE: { label: 'Needs Care', className: 'bg-orange-100 text-orange-700' },
  INJURED: { label: 'Injured', className: 'bg-red-100 text-red-700' },
  RECOVERING: { label: 'Recovering', className: 'bg-yellow-100 text-yellow-700' },
}

/** Adoption status color */
export const ADOPTION_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending Review', className: 'bg-yellow-100 text-yellow-800' },
  APPROVED: { label: 'Approved', className: 'bg-forest-100 text-forest-800' },
  REJECTED: { label: 'Not Approved', className: 'bg-red-100 text-red-800' },
  CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 text-gray-700' },
}
