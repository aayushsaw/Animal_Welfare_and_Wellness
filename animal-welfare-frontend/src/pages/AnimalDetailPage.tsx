import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  MapPin, Calendar, Heart, ArrowLeft, ChevronLeft, ChevronRight, 
  Loader2, Trash2, Edit3, Archive, RefreshCw, X, ZoomIn, ZoomOut, Maximize 
} from 'lucide-react'
import { animalsApi } from '@/api/animals.api'
import { useAuthStore } from '@/store/auth.store'
import { resolveImageUrl, CATEGORY_LABELS, HEALTH_STATUS_CONFIG, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { AnimalImage, AnimalRequest, HealthStatus, AnimalCategory, AnimalGender } from '@/types/animal'

const STATUS_BADGE: Record<string, string> = {
  AVAILABLE: 'bg-forest-100 text-forest-800 border border-forest-200/50',
  PENDING_APPROVAL: 'bg-yellow-50 text-yellow-800 border border-yellow-200/50',
  PENDING: 'bg-orange-50 text-orange-700 border border-orange-200/50',
  ADOPTED: 'bg-gray-100 text-gray-600 border border-gray-200/50',
  ARCHIVED: 'bg-red-50 text-red-800 border border-red-200/50',
}

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Available',
  PENDING_APPROVAL: 'Pending Approval',
  PENDING: 'Adoption Pending',
  ADOPTED: 'Adopted',
  ARCHIVED: 'Archived',
}

export function AnimalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const animalId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, hasRole, isAuthenticated } = useAuthStore()

  // Gallery state
  const [activeImg, setActiveImg] = useState(0)
  const [imgZoom, setImgZoom] = useState(false)
  const [zoomScale, setZoomScale] = useState(1.5)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Adoption request state
  const [adoptMessage, setAdoptMessage] = useState('')
  const [showAdoptForm, setShowAdoptForm] = useState(false)

  // Admin / Edit state
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editForm, setEditForm] = useState<Partial<AnimalRequest>>({})

  // Fetch animal
  const { data: animal, isLoading } = useQuery({
    queryKey: ['animal', animalId],
    queryFn: () => animalsApi.getById(animalId),
    enabled: !isNaN(animalId),
  })

  // Mutations
  const adoptMutation = useMutation({
    mutationFn: () => animalsApi.adopt(animalId, { message: adoptMessage }),
    onSuccess: () => {
      toast.success('Adoption request submitted! Our team will review it shortly.')
      setShowAdoptForm(false)
      setAdoptMessage('')
      queryClient.invalidateQueries({ queryKey: ['animal', animalId] })
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? 'Could not submit request. Please try again.'
      toast.error(msg)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<AnimalRequest>) => animalsApi.update(animalId, data),
    onSuccess: () => {
      toast.success('Animal details updated successfully.')
      setIsEditing(false)
      queryClient.invalidateQueries({ queryKey: ['animal', animalId] })
      queryClient.invalidateQueries({ queryKey: ['animals'] })
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? 'Failed to update details.'
      toast.error(msg)
    },
  })

  const archiveMutation = useMutation({
    mutationFn: () => animalsApi.archive(animalId),
    onSuccess: () => {
      toast.success('Listing archived successfully.')
      queryClient.invalidateQueries({ queryKey: ['animal', animalId] })
      queryClient.invalidateQueries({ queryKey: ['animals'] })
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? 'Failed to archive listing.'
      toast.error(msg)
    },
  })

  const restoreMutation = useMutation({
    mutationFn: () => animalsApi.restore(animalId),
    onSuccess: () => {
      toast.success('Listing restored to Available status.')
      queryClient.invalidateQueries({ queryKey: ['animal', animalId] })
      queryClient.invalidateQueries({ queryKey: ['animals'] })
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? 'Failed to restore listing.'
      toast.error(msg)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => animalsApi.delete(animalId),
    onSuccess: () => {
      toast.success('Listing deleted permanently.')
      navigate('/animals')
      queryClient.invalidateQueries({ queryKey: ['animals'] })
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? 'Failed to delete listing.'
      toast.error(msg)
    },
  })

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-forest-600 animate-spin" />
          <span className="text-sm font-medium text-brown-600">Loading details...</span>
        </div>
      </div>
    )
  }

  if (!animal) {
    return (
      <div className="pt-20 min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-2xl border border-sage-100 shadow-sm max-w-sm">
          <p className="font-serif text-2xl text-brown-700 mb-2">Animal not found</p>
          <p className="text-xs text-brown-500 mb-4">The listing you are looking for might have been removed.</p>
          <Link 
            to="/animals" 
            className="px-5 py-2 text-sm bg-forest-600 hover:bg-forest-500 text-white rounded-xl font-semibold transition-colors inline-block"
          >
            Back to Animals
          </Link>
        </div>
      </div>
    )
  }

  const images: AnimalImage[] = animal.images.length
    ? animal.images
    : [{ id: 0, imageUrl: '/placeholder-animal.jpg', primary: true }]

  const activeImage = images[activeImg]
  const resolvedUrl = resolveImageUrl(activeImage?.imageUrl)

  const isOwner = animal.postedBy?.username === user?.username
  const isAdmin = hasRole('ADMIN')
  const canManage = isOwner || isAdmin

  const startEditing = () => {
    setEditForm({
      name: animal.name,
      category: animal.category,
      breed: animal.breed,
      ageMonths: animal.ageMonths,
      gender: animal.gender,
      color: animal.color,
      location: animal.location,
      description: animal.description,
      healthStatus: animal.healthStatus,
      vaccinated: animal.vaccinated,
      neutered: animal.neutered,
    })
    setIsEditing(true)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(editForm)
  }

  return (
    <div className="pt-20 min-h-screen bg-cream-100">
      <div className="container-max py-8">
        
        {/* Navigation Breadcrumb */}
        <Link
          to="/animals"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-brown-500 hover:text-forest-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stray Directory
        </Link>

        <div className="grid lg:grid-cols-2 gap-10">
          
          {/* ── Left Column: Media Gallery ── */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-tr from-cream-100 to-cream-50 border border-sage-100 shadow-sm flex items-center justify-center group/gallery">
              
              {/* Blurred background image */}
              <img
                src={resolvedUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-20 scale-105 pointer-events-none"
              />
              
              {/* Foreground interactive main image */}
              <img
                src={resolvedUrl}
                alt={animal.name}
                onClick={() => setIsFullscreen(true)}
                className="relative max-w-full max-h-full object-contain z-10 cursor-zoom-in hover:scale-102 transition-transform duration-300"
              />

              {/* Gallery Controls */}
              <div className="absolute top-3 right-3 z-20 flex gap-2">
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-brown-700 flex items-center justify-center shadow-sm backdrop-blur-sm transition-colors"
                  title="Fullscreen preview"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((i) => Math.max(0, i - 1))}
                    disabled={activeImg === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-brown-700 flex items-center justify-center shadow-sm backdrop-blur-sm disabled:opacity-30 disabled:pointer-events-none transition-colors z-20"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImg((i) => Math.min(images.length - 1, i + 1))}
                    disabled={activeImg === images.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-brown-700 flex items-center justify-center shadow-sm backdrop-blur-sm disabled:opacity-30 disabled:pointer-events-none transition-colors z-20"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id || i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      i === activeImg ? 'border-forest-500 scale-95 shadow-sm' : 'border-transparent opacity-85 hover:opacity-100 hover:border-sage-300'
                    }`}
                  >
                    <img
                      src={resolveImageUrl(img.imageUrl)}
                      alt={`${animal.name} thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right Column: Info & Administrative Details ── */}
          <div className="space-y-6">
            
            {!isEditing ? (
              <>
                {/* Headers & Badges */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${STATUS_BADGE[animal.status]}`}>
                      {STATUS_LABELS[animal.status] ?? animal.status}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white text-brown-600 border border-sage-100/80 text-xs font-semibold">
                      {CATEGORY_LABELS[animal.category] ?? animal.category}
                    </span>
                    {animal.breed && (
                      <span className="px-3 py-1 rounded-full bg-white text-brown-600 border border-sage-100/80 text-xs">
                        {animal.breed}
                      </span>
                    )}
                  </div>

                  <h1 className="font-serif text-4xl text-brown-800 font-bold leading-tight">{animal.name}</h1>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-brown-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-sage-400" />
                      {animal.location}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-sage-400" />
                      Posted {formatDate(animal.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-sage-100/80">
                  <div className="p-3 bg-cream-50/50 rounded-xl text-center">
                    <span className="block text-[10px] text-brown-400 font-bold uppercase tracking-wide">Category</span>
                    <span className="text-sm font-semibold text-brown-800 mt-1 block">{CATEGORY_LABELS[animal.category]}</span>
                  </div>
                  <div className="p-3 bg-cream-50/50 rounded-xl text-center">
                    <span className="block text-[10px] text-brown-400 font-bold uppercase tracking-wide">Gender</span>
                    <span className="text-sm font-semibold text-brown-800 mt-1 block">
                      {animal.gender === 'MALE' ? 'Male' : animal.gender === 'FEMALE' ? 'Female' : 'Unknown'}
                    </span>
                  </div>
                  <div className="p-3 bg-cream-50/50 rounded-xl text-center">
                    <span className="block text-[10px] text-brown-400 font-bold uppercase tracking-wide">Age</span>
                    <span className="text-sm font-semibold text-brown-800 mt-1 block">
                      {animal.ageMonths !== undefined && animal.ageMonths !== null
                        ? animal.ageMonths < 12
                          ? `${animal.ageMonths} mo`
                          : `${Math.floor(animal.ageMonths / 12)}y${animal.ageMonths % 12 > 0 ? ` ${animal.ageMonths % 12}m` : ''}`
                        : 'Unknown'}
                    </span>
                  </div>
                  <div className="p-3 bg-cream-50/50 rounded-xl text-center">
                    <span className="block text-[10px] text-brown-400 font-bold uppercase tracking-wide">Health</span>
                    <span className="text-sm font-semibold text-brown-800 mt-1 block">
                      {HEALTH_STATUS_CONFIG[animal.healthStatus]?.label ?? animal.healthStatus}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {animal.description && (
                  <div className="bg-white p-5 rounded-2xl border border-sage-100/80 space-y-2">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-brown-500">Story & Personality</h3>
                    <p className="text-sm text-brown-600 leading-relaxed text-balance">{animal.description}</p>
                  </div>
                )}

                {/* Contribution details */}
                <div className="text-xs font-semibold text-brown-400/90 flex flex-wrap items-center gap-1.5">
                  <span>Rescuer:</span>
                  <span className="text-brown-700 bg-white border border-sage-100/60 px-2 py-0.5 rounded-md">
                    {animal.postedBy?.fullName || animal.postedBy?.username}
                  </span>
                  <span>(@{animal.postedBy?.username || 'unknown'})</span>
                </div>

                {/* ── Adoption Forms & Actions ── */}
                {animal.status === 'AVAILABLE' && (
                  <div className="pt-2">
                    {!showAdoptForm ? (
                      <button
                        onClick={() => {
                          if (!isAuthenticated) {
                            toast.error('Please sign in to request adoption.')
                            return
                          }
                          setShowAdoptForm(true)
                        }}
                        data-testid="request-adoption-btn"
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-orange-400 hover:bg-orange-300 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow text-base"
                      >
                        <Heart className="w-5 h-5 fill-white" />
                        Adopt Me
                      </button>
                    ) : (
                      <div className="bg-white rounded-2xl border border-sage-200 p-5 space-y-4 shadow-sm animate-fadeIn">
                        <h3 className="font-serif text-lg font-bold text-brown-800">Submit Adoption Request</h3>
                        <p className="text-xs text-brown-500 leading-normal">
                          Tell us a little bit about yourself, your household, and why you believe you'd be a perfect companion for {animal.name}.
                        </p>
                        <textarea
                          value={adoptMessage}
                          onChange={(e) => setAdoptMessage(e.target.value)}
                          data-testid="adopt-message-input"
                          placeholder="Tell us about your space, pets you have, and why you want to adopt..."
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl border border-sage-200 text-sm text-brown-700 placeholder-brown-300 focus:outline-none focus:ring-2 focus:ring-forest-400 resize-none"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowAdoptForm(false)}
                            className="flex-1 py-3 rounded-xl border border-sage-200 text-brown-600 text-xs font-semibold hover:bg-cream-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => adoptMutation.mutate()}
                            data-testid="adopt-submit-btn"
                            disabled={adoptMutation.isPending || !adoptMessage.trim()}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-forest-500 hover:bg-forest-600 text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none"
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
                  <div className="w-full px-6 py-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 text-sm font-semibold text-center">
                    An adoption review is in progress.
                  </div>
                )}

                {animal.status === 'ADOPTED' && (
                  <div className="w-full px-6 py-4 bg-forest-50 border border-forest-200 rounded-xl text-forest-700 text-sm font-semibold text-center">
                    🎉 {animal.name} has been adopted into a loving family!
                  </div>
                )}

                {/* ── Administrative & Owner Management Panel ── */}
                {canManage && (
                  <div className="pt-4 border-t border-sage-100 space-y-3">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-brown-500">Rescue Moderation Controls</h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                      <button
                        onClick={startEditing}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-sage-50 text-brown-700 border border-sage-200 rounded-xl text-xs font-semibold transition-all shadow-xs"
                      >
                        <Edit3 className="w-4 h-4 text-forest-600" />
                        Edit Listing
                      </button>

                      {animal.status !== 'ARCHIVED' ? (
                        <button
                          onClick={() => archiveMutation.mutate()}
                          disabled={archiveMutation.isPending}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-orange-50 text-orange-700 border border-orange-200 rounded-xl text-xs font-semibold transition-all shadow-xs"
                        >
                          <Archive className="w-4 h-4" />
                          Archive
                        </button>
                      ) : (
                        <button
                          onClick={() => restoreMutation.mutate()}
                          disabled={restoreMutation.isPending}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-forest-50 text-forest-700 border border-forest-200 rounded-xl text-xs font-semibold transition-all shadow-xs"
                        >
                          <RefreshCw className="w-4 h-4 animate-spin-reverse" />
                          Restore
                        </button>
                      )}

                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="col-span-2 md:col-span-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold transition-all shadow-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Post
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Inline Edit Form */
              <form onSubmit={handleSaveEdit} className="bg-white p-6 rounded-2xl border border-sage-200 space-y-4 shadow-sm animate-fadeIn">
                <div className="flex justify-between items-center pb-2 border-b border-sage-100">
                  <h3 className="font-serif text-lg font-bold text-brown-800">Edit Animal Details</h3>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="p-1 rounded-full hover:bg-cream-100 text-brown-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-brown-500 mb-1">Name</label>
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg border border-sage-200 text-brown-800 focus:outline-none focus:ring-2 focus:ring-forest-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-brown-500 mb-1">Category</label>
                    <select
                      value={editForm.category || 'DOG'}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value as AnimalCategory })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-sage-200 text-brown-800 focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white"
                    >
                      <option value="DOG">Dog</option>
                      <option value="CAT">Cat</option>
                      <option value="BIRD">Bird</option>
                      <option value="RABBIT">Rabbit</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-brown-500 mb-1">Breed</label>
                    <input
                      type="text"
                      value={editForm.breed || ''}
                      onChange={(e) => setEditForm({ ...editForm, breed: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-sage-200 text-brown-800 focus:outline-none focus:ring-2 focus:ring-forest-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-brown-500 mb-1">Age (Months)</label>
                    <input
                      type="number"
                      value={editForm.ageMonths ?? ''}
                      onChange={(e) => setEditForm({ ...editForm, ageMonths: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-sage-200 text-brown-800 focus:outline-none focus:ring-2 focus:ring-forest-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-brown-500 mb-1">Gender</label>
                    <select
                      value={editForm.gender || 'UNKNOWN'}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as AnimalGender })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-sage-200 text-brown-800 focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="UNKNOWN">Unknown</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-brown-500 mb-1">Health Status</label>
                    <select
                      value={editForm.healthStatus || 'HEALTHY'}
                      onChange={(e) => setEditForm({ ...editForm, healthStatus: e.target.value as HealthStatus })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-sage-200 text-brown-800 focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white"
                    >
                      <option value="HEALTHY">Healthy</option>
                      <option value="VACCINATED">Vaccinated</option>
                      <option value="NEEDS_CARE">Needs Care</option>
                      <option value="INJURED">Injured</option>
                      <option value="RECOVERING">Recovering</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-brown-500 mb-1">Location</label>
                    <input
                      type="text"
                      value={editForm.location || ''}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg border border-sage-200 text-brown-800 focus:outline-none focus:ring-2 focus:ring-forest-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-brown-500 mb-1">Color</label>
                    <input
                      type="text"
                      value={editForm.color || ''}
                      onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-sage-200 text-brown-800 focus:outline-none focus:ring-2 focus:ring-forest-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-brown-500 mb-1">Description / Rescue Details</label>
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-sage-200 text-brown-800 focus:outline-none focus:ring-2 focus:ring-forest-400 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2.5 rounded-xl border border-sage-200 text-brown-600 text-xs font-semibold hover:bg-cream-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex-1 py-2.5 rounded-xl bg-forest-500 hover:bg-forest-600 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    {updateMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>

      {/* ── Custom Fullscreen Image Viewer Modal ── */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 select-none animate-fadeIn">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white p-2">
            <span className="text-xs font-semibold tracking-wider uppercase opacity-80">
              {animal.name} — Photo {activeImg + 1} of {images.length}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setImgZoom((z) => !z)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                title={imgZoom ? "Zoom Out" : "Zoom In"}
              >
                {imgZoom ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
              </button>
              <button
                onClick={() => {
                  setIsFullscreen(false)
                  setImgZoom(false)
                }}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Image Container */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            <img
              src={resolvedUrl}
              alt={animal.name}
              style={{
                transform: imgZoom ? `scale(${zoomScale})` : 'scale(1)',
                cursor: imgZoom ? 'zoom-out' : 'zoom-in',
              }}
              onClick={() => setImgZoom((z) => !z)}
              className="max-w-full max-h-[80vh] object-contain transition-transform duration-300 ease-out z-10"
            />

            {/* Scale controls when zoomed */}
            {imgZoom && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-25 bg-black/60 border border-white/10 px-4 py-2 rounded-full flex items-center gap-3 text-white text-xs">
                <span>Scale:</span>
                <input
                  type="range"
                  min="1.2"
                  max="3"
                  step="0.1"
                  value={zoomScale}
                  onChange={(e) => setZoomScale(parseFloat(e.target.value))}
                  className="w-24 accent-forest-500"
                />
                <span>{zoomScale.toFixed(1)}x</span>
              </div>
            )}

            {/* Slider Navigation */}
            {images.length > 1 && !imgZoom && (
              <>
                <button
                  onClick={() => setActiveImg((i) => Math.max(0, i - 1))}
                  disabled={activeImg === 0}
                  className="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-10 transition-colors z-20"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setActiveImg((i) => Math.min(images.length - 1, i + 1))}
                  disabled={activeImg === images.length - 1}
                  className="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-10 transition-colors z-20"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails */}
          {images.length > 1 && !imgZoom && (
            <div className="flex justify-center gap-2 pb-4 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id || i}
                  onClick={() => setActiveImg(i)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    i === activeImg ? 'border-white scale-90' : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={resolveImageUrl(img.imageUrl)} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Custom Deletion Confirmation Dialog ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-sage-100 max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-serif text-xl font-bold text-brown-800">Delete Listing Permanently?</h3>
            <p className="text-xs text-brown-500 leading-relaxed">
              Are you sure you want to permanently delete <strong>{animal.name}</strong>'s stray listing? This action deletes all attachments from Cloudinary and cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-sage-200 text-brown-600 text-xs font-semibold hover:bg-cream-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                {deleteMutation.isPending ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting…</>
                ) : (
                  'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
