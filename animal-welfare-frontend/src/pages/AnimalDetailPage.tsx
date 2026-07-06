import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Calendar, Heart, ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { animalsApi } from '@/api/animals.api'
import { useAuthStore } from '@/store/auth.store'
import { resolveImageUrl, CATEGORY_LABELS, HEALTH_STATUS_CONFIG, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { AnimalImage } from '@/types/animal'

export function AnimalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const animalId = Number(id)
  const [activeImg, setActiveImg] = useState(0)
  const [adoptMessage, setAdoptMessage] = useState('')
  const [showAdoptForm, setShowAdoptForm] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: animal, isLoading } = useQuery({
    queryKey: ['animal', animalId],
    queryFn: () => animalsApi.getById(animalId),
    enabled: !isNaN(animalId),
  })

  const adoptMutation = useMutation({
    mutationFn: () => animalsApi.adopt(animalId, { message: adoptMessage }),
    onSuccess: () => {
      toast.success('Adoption request submitted! Our team will review it shortly.')
      setShowAdoptForm(false)
      setAdoptMessage('')
      queryClient.invalidateQueries({ queryKey: ['animal', animalId] })
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Could not submit request. Please try again.'
      toast.error(message)
    },
  })

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen bg-cream-100">
        <div className="container-max py-12">
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="skeleton h-[420px] rounded-2xl" />
            <div className="space-y-4">
              <div className="skeleton h-9 w-2/3" />
              <div className="skeleton h-5 w-1/2" />
              <div className="skeleton h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!animal) {
    return (
      <div className="pt-20 min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-2xl text-brown-700">Animal not found</p>
          <Link to="/animals" className="mt-4 text-forest-600 text-sm hover:underline inline-block">
            ← Back to animals
          </Link>
        </div>
      </div>
    )
  }

  const images: AnimalImage[] = animal.images.length
    ? animal.images
    : [{ id: 0, imageUrl: '/assets/stray_animals/stray1.jpg', primary: true }]

  const health = HEALTH_STATUS_CONFIG[animal.healthStatus]

  return (
    <div className="pt-20 min-h-screen bg-cream-100">
      <div className="container-max py-10">
        {/* Breadcrumb */}
        <Link
          to="/animals"
          className="inline-flex items-center gap-1.5 text-sm text-brown-500 hover:text-forest-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to animals
        </Link>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Image gallery */}
          <div>
            <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-sage-100 h-[420px]">
              <img
                src={resolveImageUrl(images[activeImg]?.imageUrl)}
                alt={animal.name}
                className="w-full h-full object-cover transition-opacity duration-300"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((i) => Math.max(0, i - 1))}
                    disabled={activeImg === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow-sm disabled:opacity-30 hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-brown-700" />
                  </button>
                  <button
                    onClick={() => setActiveImg((i) => Math.min(images.length - 1, i + 1))}
                    disabled={activeImg === images.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow-sm disabled:opacity-30 hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-brown-700" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      i === activeImg ? 'border-forest-500' : 'border-transparent hover:border-sage-300'
                    }`}
                  >
                    <img
                      src={resolveImageUrl(img.imageUrl)}
                      alt={`${animal.name} photo ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="font-serif text-4xl text-brown-800">{animal.name}</h1>
              {health && (
                <span className={`shrink-0 px-3 py-1 rounded-full text-sm font-medium ${health.className}`}>
                  {health.label}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              <span className="px-3 py-1 rounded-full bg-forest-100 text-forest-700 text-sm font-medium">
                {CATEGORY_LABELS[animal.category]}
              </span>
              {animal.breed && (
                <span className="px-3 py-1 rounded-full bg-cream-200 text-brown-600 text-sm">
                  {animal.breed}
                </span>
              )}
              {animal.ageMonths !== undefined && animal.ageMonths !== null && (
                <span className="px-3 py-1 rounded-full bg-cream-200 text-brown-600 text-sm">
                  {animal.ageMonths < 12
                    ? `${animal.ageMonths} month${animal.ageMonths !== 1 ? 's' : ''}`
                    : `${Math.floor(animal.ageMonths / 12)} year${Math.floor(animal.ageMonths / 12) !== 1 ? 's' : ''}${animal.ageMonths % 12 > 0 ? ` ${animal.ageMonths % 12} mo` : ''}`}
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-cream-200 text-brown-600 text-sm">
                {animal.gender === 'MALE' ? '♂ Male' : animal.gender === 'FEMALE' ? '♀ Female' : 'Unknown sex'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-brown-500 mb-5">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-forest-400" />
                {animal.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-forest-400" />
                Posted {formatDate(animal.createdAt)}
              </span>
            </div>

            {animal.description && (
              <div className="mb-6 p-4 bg-white rounded-xl border border-sage-100">
                <p className="text-brown-600 text-sm leading-relaxed">{animal.description}</p>
              </div>
            )}

            <div className="text-xs text-brown-400 mb-6">
              Posted by <span className="font-medium text-brown-600">{animal.postedBy?.fullName || animal.postedBy?.username || 'Unknown'}</span>
            </div>

            {/* Adoption action */}
            {animal.status === 'AVAILABLE' && (
              <div>
                {!showAdoptForm ? (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast.error('Please sign in to request adoption.')
                        return
                      }
                      setShowAdoptForm(true)
                    }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-orange-400 hover:bg-orange-300 text-white font-semibold rounded-xl transition-all shadow-sm text-base"
                  >
                    <Heart className="w-5 h-5 fill-white" />
                    Request Adoption
                  </button>
                ) : (
                  <div className="bg-white rounded-xl border border-sage-200 p-5 space-y-4">
                    <h3 className="font-serif text-lg text-brown-800">Tell us about yourself</h3>
                    <p className="text-sm text-brown-500">
                      Why would {animal.name} be a good fit for your home?
                    </p>
                    <textarea
                      value={adoptMessage}
                      onChange={(e) => setAdoptMessage(e.target.value)}
                      placeholder={`I would love to adopt ${animal.name} because…`}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-sage-200 text-sm text-brown-700 placeholder-brown-300 focus:outline-none focus:ring-2 focus:ring-forest-400 resize-none"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowAdoptForm(false)}
                        className="flex-1 py-3 rounded-xl border border-sage-200 text-brown-600 text-sm font-medium hover:bg-cream-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => adoptMutation.mutate()}
                        disabled={adoptMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-forest-500 hover:bg-forest-600 text-white text-sm font-semibold transition-colors"
                      >
                        {adoptMutation.isPending ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                        ) : (
                          'Submit Request'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {animal.status === 'PENDING' && (
              <div className="w-full px-6 py-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 text-sm font-medium text-center">
                An adoption review is in progress for this animal.
              </div>
            )}

            {animal.status === 'ADOPTED' && (
              <div className="w-full px-6 py-4 bg-forest-50 border border-forest-200 rounded-xl text-forest-700 text-sm font-medium text-center">
                🎉 {animal.name} has found a loving home!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
