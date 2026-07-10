import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Syringe, Scissors } from 'lucide-react'
import type { AnimalResponse } from '@/types/animal'
import { getPrimaryImage, getThumbnailUrl, CATEGORY_LABELS, HEALTH_STATUS_CONFIG, formatDate } from '@/lib/utils'

interface AnimalCardProps {
  animal: AnimalResponse
}

// Gender symbols with accessible labels
const GENDER_LABEL: Record<string, string> = {
  MALE:    'Male',
  FEMALE:  'Female',
  UNKNOWN: 'Unknown',
}
const GENDER_SYMBOL: Record<string, string> = {
  MALE:    '♂',
  FEMALE:  '♀',
  UNKNOWN: '–',
}

// Tailwind classes for status badges — warm NGO palette
const STATUS_BADGE: Record<string, string> = {
  AVAILABLE:       'bg-forest-100 text-forest-800 border border-forest-200',
  PENDING_APPROVAL:'bg-amber-50   text-amber-800  border border-amber-200',
  PENDING:         'bg-orange-50  text-orange-700 border border-orange-200',
  ADOPTED:         'bg-gray-100   text-gray-600   border border-gray-200',
  ARCHIVED:        'bg-red-50     text-red-700    border border-red-200',
}
const STATUS_LABELS: Record<string, string> = {
  AVAILABLE:        'Available',
  PENDING_APPROVAL: 'Pending Review',
  PENDING:          'Adoption Pending',
  ADOPTED:          'Adopted ✓',
  ARCHIVED:         'Archived',
}

// NGO-themed SVG fallback — shown when image fails or is missing
function FallbackImage() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-cream-100 via-cream-50 to-sage-50 gap-3">
      {/* Paw print illustration */}
      <svg
        viewBox="0 0 64 64"
        className="w-14 h-14 opacity-30"
        fill="currentColor"
        aria-hidden="true"
        style={{ color: '#74C69D' }}
      >
        <ellipse cx="18" cy="14" rx="6" ry="8" />
        <ellipse cx="32" cy="9"  rx="5" ry="7" />
        <ellipse cx="46" cy="14" rx="6" ry="8" />
        <ellipse cx="11" cy="27" rx="5" ry="7" />
        <path d="M32 22 C18 22 10 33 12 44 C14 53 20 56 32 56 C44 56 50 53 52 44 C54 33 46 22 32 22Z" />
      </svg>
      <span className="text-[11px] font-semibold tracking-wide text-brown-400">No photo available</span>
    </div>
  )
}

export function AnimalCard({ animal }: AnimalCardProps) {
  const rawUrl    = getPrimaryImage(animal.images)
  const thumbUrl  = getThumbnailUrl(rawUrl)
  const health    = HEALTH_STATUS_CONFIG[animal.healthStatus]

  const [imgError,   setImgError]   = useState(false)
  const [imgLoading, setImgLoading] = useState(true)

  const ageLabel = (() => {
    const m = animal.ageMonths
    if (m == null || m === undefined) return 'Age unknown'
    if (m < 1)  return 'Newborn'
    if (m < 12) return `${m} mo`
    const y = Math.floor(m / 12)
    const rem = m % 12
    return rem > 0 ? `${y}y ${rem}m` : `${y}y`
  })()

  return (
    <Link
      to={`/animals/${animal.id}`}
      data-testid="animal-card"
      className={`
        group flex flex-col h-full
        bg-white rounded-2xl overflow-hidden
        border border-sage-100 hover:border-sage-300
        shadow-sm hover:shadow-lg
        transition-all duration-300 ease-out
        hover:-translate-y-1
      `}
    >
      {/* ── Image Section (fixed 4:3 aspect ratio) ─────────────────────────── */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: '4/3', backgroundColor: '#FFF8F0' }}
      >
        {/* Loading skeleton pulse */}
        {imgLoading && !imgError && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-cream-100 via-cream-200 to-cream-100 z-10" />
        )}

        {!imgError ? (
          <img
            src={thumbUrl}
            alt={animal.name}
            onError={()  => { setImgError(true);   setImgLoading(false) }}
            onLoad={()   => { setImgLoading(false) }}
            className={`
              absolute inset-0 w-full h-full
              object-contain
              transition-all duration-500
              group-hover:scale-[1.04]
              ${imgLoading ? 'opacity-0' : 'opacity-100'}
            `}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <FallbackImage />
        )}

        {/* ── Overlay badges ── */}
        {/* Status — top left */}
        <span
          className={`
            absolute top-2.5 left-2.5 z-20
            px-2.5 py-1 rounded-full
            text-[10px] uppercase tracking-wider font-bold
            shadow-sm backdrop-blur-sm
            ${STATUS_BADGE[animal.status] ?? 'bg-gray-100 text-gray-600 border border-gray-200'}
          `}
        >
          {STATUS_LABELS[animal.status] ?? animal.status}
        </span>

        {/* Category — top right */}
        <span
          className="
            absolute top-2.5 right-2.5 z-20
            px-2.5 py-1 rounded-full
            text-[10px] uppercase tracking-wider font-bold
            bg-white/90 text-brown-700 border border-sage-100
            shadow-sm backdrop-blur-sm
          "
        >
          {CATEGORY_LABELS[animal.category] ?? animal.category}
        </span>

        {/* Hover "view" CTA — bottom centre */}
        <div
          className="
            absolute inset-x-0 bottom-0 z-20
            flex items-center justify-center
            py-2 px-3
            bg-gradient-to-t from-black/40 to-transparent
            opacity-0 group-hover:opacity-100
            transition-opacity duration-300
          "
        >
          <span className="text-[11px] font-bold text-white uppercase tracking-widest">
            View Details →
          </span>
        </div>
      </div>

      {/* ── Content Section ─────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Name + Health badge row */}
        <div className="flex items-start justify-between gap-2">
          <h3
            data-testid="animal-card-name"
            className="
              font-serif font-semibold text-brown-800 text-base leading-snug
              group-hover:text-forest-700 transition-colors
              line-clamp-1
            "
          >
            {animal.name}
          </h3>
          {health && (
            <span
              className={`
                shrink-0 px-2 py-0.5 rounded-full
                text-[9px] font-bold uppercase tracking-wide border
                ${health.className}
              `}
            >
              {health.label}
            </span>
          )}
        </div>

        {/* Breed · Age · Gender */}
        <p className="text-xs text-brown-500 font-medium line-clamp-1 flex items-center gap-1.5">
          <span>{animal.breed ?? CATEGORY_LABELS[animal.category]}</span>
          <span className="text-brown-300">·</span>
          <span>{ageLabel}</span>
          <span className="text-brown-300">·</span>
          <span
            aria-label={GENDER_LABEL[animal.gender] ?? 'Unknown'}
            className="font-bold text-brown-600"
          >
            {GENDER_SYMBOL[animal.gender] ?? '–'}
          </span>
        </p>

        {/* Vaccination / Neutered chips */}
        {(animal.vaccinated || animal.neutered) && (
          <div className="flex gap-1.5">
            {animal.vaccinated && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-sage-50 text-sage-700 border border-sage-200 rounded-full text-[9px] font-bold uppercase">
                <Syringe className="w-2.5 h-2.5" />
                Vaccinated
              </span>
            )}
            {animal.neutered && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-forest-50 text-forest-700 border border-forest-200 rounded-full text-[9px] font-bold uppercase">
                <Scissors className="w-2.5 h-2.5" />
                Neutered
              </span>
            )}
          </div>
        )}

        {/* Footer: Location + Date */}
        <div className="mt-auto pt-3 border-t border-sage-100 flex items-center justify-between text-[10px] text-brown-400 font-medium">
          <span className="flex items-center gap-1 truncate max-w-[60%]">
            <MapPin className="w-3 h-3 text-sage-400 shrink-0" />
            <span className="truncate">{animal.location}</span>
          </span>
          <span className="shrink-0">{formatDate(animal.createdAt)}</span>
        </div>
      </div>
    </Link>
  )
}
