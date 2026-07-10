import { Link } from 'react-router-dom'
import { MapPin, Heart, Calendar } from 'lucide-react'
import type { AnimalResponse } from '@/types/animal'
import { getPrimaryImage, CATEGORY_LABELS, HEALTH_STATUS_CONFIG, formatDate } from '@/lib/utils'

interface AnimalCardProps {
  animal: AnimalResponse
}

const GENDER_ICON: Record<string, string> = {
  MALE: '♂',
  FEMALE: '♀',
  UNKNOWN: '?',
}

const STATUS_BADGE: Record<string, string> = {
  AVAILABLE: 'bg-forest-100 text-forest-700',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
  PENDING: 'bg-orange-100 text-orange-700',
  ADOPTED: 'bg-gray-100 text-gray-600',
}

export function AnimalCard({ animal }: AnimalCardProps) {
  const imageUrl = getPrimaryImage(animal.images)
  const health = HEALTH_STATUS_CONFIG[animal.healthStatus]

  return (
    <Link
      to={`/animals/${animal.id}`}
      data-testid="animal-card"
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-sage-100 card-hover"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-cream-50 flex items-center justify-center">
        {/* Background blurred image for ambient aesthetic */}
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-md opacity-25 scale-110 pointer-events-none"
        />
        {/* Foreground clean image */}
        <img
          src={imageUrl}
          alt={animal.name}
          className="relative max-w-full max-h-full object-contain z-10 group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Status badge */}
        <span
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[animal.status]}`}
        >
          {animal.status === 'AVAILABLE'
            ? 'Available'
            : animal.status === 'PENDING_APPROVAL'
            ? 'Pending Approval'
            : animal.status === 'PENDING'
            ? 'Pending'
            : 'Adopted'}
        </span>

        {/* Category badge */}
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-brown-700 backdrop-blur-sm">
          {CATEGORY_LABELS[animal.category] ?? animal.category}
        </span>

        {/* Heart icon */}
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Heart className="w-4 h-4 text-orange-400" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3
              data-testid="animal-card-name"
              className="font-serif font-semibold text-brown-800 text-lg leading-tight group-hover:text-forest-600 transition-colors"
            >
              {animal.name}
            </h3>
            <p className="text-sm text-brown-500 mt-0.5">
              {animal.breed ?? CATEGORY_LABELS[animal.category]}
              {animal.ageMonths !== undefined && animal.ageMonths !== null && ` · ${animal.ageMonths < 12 ? `${animal.ageMonths}m` : `${Math.floor(animal.ageMonths / 12)}y${animal.ageMonths % 12 > 0 ? ` ${animal.ageMonths % 12}m` : ''}`}`}
              {' · '}{GENDER_ICON[animal.gender]}
            </p>
          </div>
          {health && (
            <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${health.className}`}>
              {health.label}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-brown-400">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {animal.location}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(animal.createdAt)}
          </span>
        </div>

        {animal.status === 'AVAILABLE' && (
          <div className="mt-3 pt-3 border-t border-sage-100">
            <span className="text-xs font-semibold text-forest-600 group-hover:text-forest-700">
              Tap to view & adopt →
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
