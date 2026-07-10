import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Heart, Calendar } from 'lucide-react'
import type { AnimalResponse } from '@/types/animal'
import { getPrimaryImage, getThumbnailUrl, CATEGORY_LABELS, HEALTH_STATUS_CONFIG, formatDate } from '@/lib/utils'

interface AnimalCardProps {
  animal: AnimalResponse
}

const GENDER_ICON: Record<string, string> = {
  MALE: '♂',
  FEMALE: '♀',
  UNKNOWN: '?',
}

const STATUS_BADGE: Record<string, string> = {
  AVAILABLE: 'bg-forest-100 text-forest-700 border border-forest-200/50',
  PENDING_APPROVAL: 'bg-yellow-50 text-yellow-800 border border-yellow-200/50',
  PENDING: 'bg-orange-50 text-orange-700 border border-orange-200/50',
  ADOPTED: 'bg-gray-100 text-gray-600 border border-gray-200/50',
}

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Available',
  PENDING_APPROVAL: 'Pending Review',
  PENDING: 'Adoption Pending',
  ADOPTED: 'Adopted',
}

export function AnimalCard({ animal }: AnimalCardProps) {
  const imageUrl = getPrimaryImage(animal.images)
  const thumbnailUrl = getThumbnailUrl(imageUrl)
  const health = HEALTH_STATUS_CONFIG[animal.healthStatus]

  const [imgError, setImgError] = useState(false)
  const [imgLoading, setImgLoading] = useState(true)

  const handleImageError = () => {
    setImgError(true)
    setImgLoading(false)
  }

  const handleImageLoad = () => {
    setImgLoading(false)
  }

  // Soft gradient backdrop for transparent images or fallback
  const fallbackPlaceholder = (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-cream-100 via-cream-50 to-sage-50 p-4">
      <svg
        className="w-12 h-12 text-sage-300 mb-2 stroke-current"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5C8.13 5 5 8.13 5 12c0 3.87 3.13 7 7 7 3.87 0 7-3.13 7-7 0-3.87-3.13-7-7-7z" />
        <path d="M9 12c.5-1 1.5-2 3-2s2.5 1 3 2" />
        <circle cx="9.5" cy="9.5" r="1.5" fill="currentColor" className="text-sage-300" />
        <circle cx="14.5" cy="9.5" r="1.5" fill="currentColor" className="text-sage-300" />
      </svg>
      <span className="text-xs text-brown-400 font-medium tracking-wide">No image available</span>
    </div>
  )

  return (
    <Link
      to={`/animals/${animal.id}`}
      data-testid="animal-card"
      className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-sage-100/80 hover:border-sage-200 transition-all duration-300 transform hover:-translate-y-0.5"
    >
      {/* Image Container with Fixed 4:3 Aspect Ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-tr from-cream-100 to-cream-50/50 flex items-center justify-center border-b border-sage-50/60">
        
        {/* Loading Skeleton */}
        {imgLoading && !imgError && (
          <div className="absolute inset-0 bg-gradient-to-r from-cream-100 via-cream-50 to-cream-100 animate-pulse" />
        )}

        {!imgError ? (
          <>
            {/* Blurry ambient backdrop */}
            <img
              src={thumbnailUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-lg opacity-20 scale-110 pointer-events-none"
            />
            {/* Foreground clean image */}
            <img
              src={thumbnailUrl}
              alt={animal.name}
              onError={handleImageError}
              onLoad={handleImageLoad}
              className={`relative max-w-full max-h-full object-contain z-10 transition-transform duration-500 group-hover:scale-105 ${
                imgLoading ? 'opacity-0' : 'opacity-100'
              }`}
              loading="lazy"
            />
          </>
        ) : (
          fallbackPlaceholder
        )}

        {/* Status Badge */}
        <span
          className={`absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold shadow-sm backdrop-blur-[2px] ${
            STATUS_BADGE[animal.status] || 'bg-gray-100 text-gray-600'
          }`}
        >
          {STATUS_LABELS[animal.status] ?? animal.status}
        </span>

        {/* Category Badge */}
        <span className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-white/95 text-brown-600 border border-sage-100/50 shadow-sm backdrop-blur-[2px]">
          {CATEGORY_LABELS[animal.category] ?? animal.category}
        </span>

        {/* Hover Heart Action Overlay */}
        <div className="absolute bottom-3 right-3 z-20 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Heart className="w-4 h-4 text-orange-400 fill-current" />
        </div>
      </div>

      {/* Content Section - occupies remaining height to align items */}
      <div className="flex-1 flex flex-col justify-between p-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3
                data-testid="animal-card-name"
                className="font-serif font-semibold text-brown-800 text-lg leading-snug group-hover:text-forest-600 transition-colors"
              >
                {animal.name}
              </h3>
              <p className="text-xs text-brown-500 mt-1 font-medium flex items-center gap-1">
                <span>{animal.breed ?? CATEGORY_LABELS[animal.category]}</span>
                <span>·</span>
                <span>
                  {animal.ageMonths !== undefined && animal.ageMonths !== null
                    ? animal.ageMonths < 12
                      ? `${animal.ageMonths}m`
                      : `${Math.floor(animal.ageMonths / 12)}y${
                          animal.ageMonths % 12 > 0 ? ` ${animal.ageMonths % 12}m` : ''
                        }`
                    : 'Unknown Age'}
                </span>
                <span>·</span>
                <span className="text-sm font-semibold">{GENDER_ICON[animal.gender] ?? '?'}</span>
              </p>
            </div>
            {health && (
              <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${health.className}`}>
                {health.label}
              </span>
            )}
          </div>
        </div>

        {/* Spacing & Metadata Footer */}
        <div className="mt-4 pt-3 border-t border-sage-100/60">
          <div className="flex items-center justify-between text-[11px] text-brown-400/90 font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-sage-400" />
              {animal.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sage-400" />
              {formatDate(animal.createdAt)}
            </span>
          </div>

          {animal.status === 'AVAILABLE' && (
            <div className="mt-3 text-xs font-semibold text-forest-600 group-hover:text-forest-700 flex items-center gap-1 transition-colors">
              <span>View details & adopt</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
