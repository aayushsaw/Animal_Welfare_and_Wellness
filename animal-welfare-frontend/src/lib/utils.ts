import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { AnimalImage } from '@/types/animal'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format ISO date string to a human-readable absolute date.
 * Used for dates older than 30 days where exact date matters.
 */
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Return a relative time string (e.g. "3 days ago", "just now", "2 months ago").
 * Falls back to formatDate for dates older than 1 year.
 */
export function timeAgo(dateString: string | undefined | null): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now  = new Date()
  const diffMs  = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr  = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr  / 24)
  const diffMo  = Math.floor(diffDay / 30)
  const diffYr  = Math.floor(diffDay / 365)

  if (diffSec < 60)   return 'just now'
  if (diffMin < 60)   return `${diffMin}m ago`
  if (diffHr  < 24)   return `${diffHr}h ago`
  if (diffDay === 1)  return 'yesterday'
  if (diffDay < 30)   return `${diffDay} days ago`
  if (diffMo  === 1)  return '1 month ago'
  if (diffMo  < 12)   return `${diffMo} months ago`
  if (diffYr  === 1)  return '1 year ago'
  if (diffYr  <  2)   return `${diffYr} years ago`
  // For old dates, show the actual date
  return formatDate(dateString)
}

/**
 * Resolve an image URL from the backend.
 * Handles both absolute URLs (Cloudinary CDN) and Spring Boot relative paths.
 */
export function resolveImageUrl(url: string | undefined | null): string {
  if (!url) return '/placeholder-animal.jpg'
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const baseUrl = import.meta.env.VITE_API_URL || ''
  if (url.startsWith('/')) return `${baseUrl}${url}`
  return `${baseUrl}/${url}`
}

/**
 * Build an optimised Cloudinary URL for card thumbnails.
 *
 * Design decisions:
 * - `c_pad`          : Letterbox to 4:3 — never crops content, works for any aspect ratio
 * - `b_rgb:FFF8F0`   : Fill padding with the brand cream colour — eliminates transparent PNG
 *                      checkerboard at the CDN level (not just CSS)
 * - `ar_4:3,w_600`   : Target size — 600px wide at 1x; Retina devices get dpr_auto upscale
 * - `dpr_auto`        : Cloudinary serves 1x, 1.5x, or 2x based on the browser's DPR header
 * - `q_auto,f_auto`   : Quality and format optimised by Cloudinary AI (WebP/AVIF where supported)
 *
 * Why NOT c_fill + g_auto?
 * Smart crop is great for opaque photos, but we cannot know at runtime if an image is a
 * transparent PNG. c_fill on a transparent PNG crops away the fill area, showing the
 * subject on a transparent background in the CDN response. c_pad is deterministically
 * correct for ALL image types.
 */
export function getThumbnailUrl(url: string | undefined | null): string {
  const resolved = resolveImageUrl(url)
  if (resolved.includes('res.cloudinary.com') && resolved.includes('/upload/')) {
    return resolved.replace(
      '/upload/',
      '/upload/q_auto,f_auto,dpr_auto,c_pad,b_rgb:FFF8F0,ar_4:3,w_600/',
    )
  }
  return resolved
}

/**
 * Build an optimised Cloudinary URL for the high-resolution detail / fullscreen viewer.
 *
 * - `c_limit,w_1600` : Constrain longest edge to 1600px — never upscales, never crops
 * - `dpr_auto`        : Serves 2x (3200px) to Retina displays automatically
 * - `q_auto,f_auto`   : Format + quality auto-selected by Cloudinary
 */
export function getDetailImageUrl(url: string | undefined | null): string {
  const resolved = resolveImageUrl(url)
  if (resolved.includes('res.cloudinary.com') && resolved.includes('/upload/')) {
    return resolved.replace('/upload/', '/upload/q_auto,f_auto,dpr_auto,c_limit,w_1600/')
  }
  return resolved
}

/** Get primary image URL from an animal image array, fallback to first */
export function getPrimaryImage(images: AnimalImage[] | undefined): string {
  if (!images || images.length === 0) return '/placeholder-animal.jpg'
  const primary = images.find((i) => i.primary)
  return resolveImageUrl(primary?.imageUrl ?? images[0]?.imageUrl)
}

/** Animal category display names */
export const CATEGORY_LABELS: Record<string, string> = {
  DOG:    'Dog',
  CAT:    'Cat',
  BIRD:   'Bird',
  RABBIT: 'Rabbit',
  OTHER:  'Other',
}

/** News category display names */
export const NEWS_CATEGORY_LABELS: Record<string, string> = {
  WELFARE_NEWS:  'Welfare News',
  SUCCESS_STORY: 'Success Story',
  CAMPAIGN:      'Campaign',
  NGO_UPDATE:    'NGO Update',
}

/** Health status configuration — label + Tailwind colour classes */
export const HEALTH_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  HEALTHY:     { label: 'Healthy',     className: 'bg-forest-100 text-forest-700 border-forest-200' },
  VACCINATED:  { label: 'Vaccinated',  className: 'bg-sage-100   text-sage-700   border-sage-200'   },
  NEEDS_CARE:  { label: 'Needs Care',  className: 'bg-orange-100 text-orange-700 border-orange-200' },
  INJURED:     { label: 'Injured',     className: 'bg-red-100    text-red-700    border-red-200'     },
  RECOVERING:  { label: 'Recovering',  className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
}

/** Adoption status configuration */
export const ADOPTION_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING:   { label: 'Pending Review', className: 'bg-yellow-100 text-yellow-800' },
  APPROVED:  { label: 'Approved',       className: 'bg-forest-100 text-forest-800' },
  REJECTED:  { label: 'Not Approved',   className: 'bg-red-100    text-red-800'    },
  CANCELLED: { label: 'Cancelled',      className: 'bg-gray-100   text-gray-700'   },
}
