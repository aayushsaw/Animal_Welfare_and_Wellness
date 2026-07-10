import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Syringe, Scissors, Heart } from 'lucide-react'
import type { AnimalResponse } from '@/types/animal'
import {
  getPrimaryImage,
  getThumbnailUrl,
  timeAgo,
  CATEGORY_LABELS,
  HEALTH_STATUS_CONFIG,
} from '@/lib/utils'

interface AnimalCardProps {
  animal: AnimalResponse
}

// ─── Constants ──────────────────────────────────────────────────────────────

const GENDER_SYMBOL: Record<string, string> = {
  MALE: '♂', FEMALE: '♀', UNKNOWN: '–',
}
const GENDER_ARIA: Record<string, string> = {
  MALE: 'Male', FEMALE: 'Female', UNKNOWN: 'Unknown gender',
}

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  AVAILABLE:        { label: 'Available',        badge: 'bg-emerald-500 text-white'           },
  PENDING_APPROVAL: { label: 'Pending Review',   badge: 'bg-amber-500  text-white'            },
  PENDING:          { label: 'Adoption Pending', badge: 'bg-orange-500 text-white'            },
  ADOPTED:          { label: 'Adopted ✓',        badge: 'bg-gray-600   text-white'            },
  ARCHIVED:         { label: 'Archived',         badge: 'bg-red-600    text-white'            },
}

// ─── Fallback Illustration ───────────────────────────────────────────────────

function PawFallback({ category }: { category: string }) {
  const emoji: Record<string, string> = {
    DOG: '🐶', CAT: '🐱', BIRD: '🐦', RABBIT: '🐰', OTHER: '🐾',
  }
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-cream-100 to-sage-50 gap-2 select-none">
      <span className="text-5xl opacity-40" role="img" aria-hidden>
        {emoji[category] ?? '🐾'}
      </span>
      <span className="text-[11px] font-semibold tracking-wide text-brown-400 uppercase">
        No photo
      </span>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AnimalCard({ animal }: AnimalCardProps) {
  const rawUrl   = getPrimaryImage(animal.images)
  const thumbUrl = getThumbnailUrl(rawUrl)
  const health   = HEALTH_STATUS_CONFIG[animal.healthStatus]
  const status   = STATUS_CONFIG[animal.status]

  const [imgError,   setImgError]   = useState(false)
  const [imgLoaded,  setImgLoaded]  = useState(false)

  const ageLabel = (() => {
    const m = animal.ageMonths
    if (m == null) return 'Age unknown'
    if (m === 0)   return 'Newborn'
    if (m < 12)    return `${m} mo old`
    const y = Math.floor(m / 12)
    const r = m % 12
    return r > 0 ? `${y}y ${r}m old` : `${y} yr old`
  })()

  return (
    <Link
      to={`/animals/${animal.id}`}
      data-testid="animal-card"
      aria-label={`${animal.name} — ${CATEGORY_LABELS[animal.category] ?? animal.category}, ${ageLabel}`}
      className={`
        group flex flex-col h-full
        bg-white rounded-2xl overflow-hidden
        border border-sage-100 hover:border-sage-300
        shadow-sm hover:shadow-xl
        transition-all duration-300 ease-out
        hover:-translate-y-1.5
        focus-visible:outline-2 focus-visible:outline-forest-500 focus-visible:outline-offset-2
        motion-safe:transition-all
      `}
    >
      {/* ── Image Container — fixed 4:3 aspect ratio ──────────────────────── */}
      <div
        className="relative w-full overflow-hidden shrink-0"
        style={{ aspectRatio: '4 / 3', backgroundColor: '#FFF8F0' }}
      >
        {/* Skeleton pulse — disappears once image loads or errors */}
        {!imgLoaded && !imgError && (
          <div
            aria-hidden
            className="absolute inset-0 z-10 bg-gradient-to-r from-cream-100 via-cream-200 to-cream-100 animate-pulse"
          />
        )}

        {/* Image */}
        {!imgError ? (
          <img
            src={thumbUrl}
            alt={animal.name}
            onError={() => { setImgError(true); setImgLoaded(true) }}
            onLoad={()  => setImgLoaded(true)}
            className={`
              absolute inset-0 w-full h-full
              object-contain
              motion-safe:transition-all motion-safe:duration-700
              motion-safe:group-hover:scale-[1.03]
              ${imgLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <PawFallback category={animal.category} />
        )}

        {/* ── Overlay Badges ── */}

        {/* Status — top left */}
        {status && (
          <span
            className={`
              absolute top-2.5 left-2.5 z-20
              px-2.5 py-1 rounded-full
              text-[9px] uppercase tracking-widest font-bold
              shadow-sm backdrop-blur-sm
              ${status.badge}
            `}
          >
            {status.label}
          </span>
        )}

        {/* Category — top right */}
        <span
          className="
            absolute top-2.5 right-2.5 z-20
            px-2.5 py-1 rounded-full
            text-[9px] uppercase tracking-widest font-bold
            bg-black/40 text-white
            shadow-sm backdrop-blur-sm
          "
        >
          {CATEGORY_LABELS[animal.category] ?? animal.category}
        </span>

        {/* Hover gradient + CTA — bottom */}
        <div
          aria-hidden
          className="
            absolute inset-x-0 bottom-0 z-20 h-20
            bg-gradient-to-t from-black/50 to-transparent
            flex items-end justify-center pb-3
            opacity-0 group-hover:opacity-100
            motion-safe:transition-opacity motion-safe:duration-300
          "
        >
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-white uppercase tracking-widest">
            <Heart className="w-3 h-3 fill-white" />
            View Profile
          </span>
        </div>
      </div>

      {/* ── Content Section ───────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 pt-3.5 gap-2">

        {/* Row 1: Name + Health badge */}
        <div className="flex items-start justify-between gap-2">
          <h3
            data-testid="animal-card-name"
            className="
              font-serif font-semibold text-brown-800
              text-base leading-snug
              line-clamp-2 flex-1
              group-hover:text-forest-700 transition-colors
            "
          >
            {animal.name}
          </h3>
          {health && (
            <span
              className={`
                shrink-0 px-2 py-0.5 rounded-full
                text-[8px] font-bold uppercase tracking-wide
                border ${health.className}
              `}
            >
              {health.label}
            </span>
          )}
        </div>

        {/* Row 2: Breed · Age · Gender — always 1 line */}
        <p className="text-xs text-brown-500 font-medium flex items-center gap-1 truncate">
          <span className="truncate">{animal.breed || CATEGORY_LABELS[animal.category]}</span>
          <span className="text-brown-300 shrink-0">·</span>
          <span className="shrink-0">{ageLabel}</span>
          <span className="text-brown-300 shrink-0">·</span>
          <span
            aria-label={GENDER_ARIA[animal.gender] ?? 'Unknown gender'}
            className="shrink-0 font-bold text-brown-700"
          >
            {GENDER_SYMBOL[animal.gender] ?? '–'}
          </span>
        </p>

        {/* Row 3: Chips — stabilised height with min-h so layout is consistent */}
        <div className="flex gap-1.5 min-h-[1.5rem] flex-wrap">
          {animal.vaccinated && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sage-50 text-sage-700 border border-sage-200 rounded-full text-[9px] font-bold uppercase">
              <Syringe className="w-2.5 h-2.5" aria-hidden />
              Vaccinated
            </span>
          )}
          {animal.neutered && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-forest-50 text-forest-700 border border-forest-200 rounded-full text-[9px] font-bold uppercase">
              <Scissors className="w-2.5 h-2.5" aria-hidden />
              Neutered
            </span>
          )}
        </div>

        {/* Footer: Location + Relative time */}
        <div className="mt-auto pt-3 border-t border-sage-100 flex items-center justify-between text-[10px] text-brown-400 font-medium">
          <span className="flex items-center gap-1 truncate max-w-[60%]">
            <MapPin className="w-3 h-3 text-sage-400 shrink-0" aria-hidden />
            <span className="truncate">{animal.location}</span>
          </span>
          <time
            dateTime={animal.createdAt}
            className="shrink-0 tabular-nums"
            title={animal.createdAt}
          >
            {timeAgo(animal.createdAt)}
          </time>
        </div>
      </div>
    </Link>
  )
}
