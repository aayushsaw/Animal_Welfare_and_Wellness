import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusCircle, Heart, FileText, Check, X, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { animalsApi } from '@/api/animals.api'
import { adoptionsApi } from '@/api/adoptions.api'
import { useAuthStore } from '@/store/auth.store'
import { resolveImageUrl, ADOPTION_STATUS_CONFIG, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

export function DashboardPage() {
  const { user, hasRole } = useAuthStore()
  const queryClient = useQueryClient()
  const [reviewNote, setReviewNote] = useState<Record<number, string>>({})
  const [reviewingId, setReviewingId] = useState<number | null>(null)
  const isAdminOrVolunteer = hasRole('ROLE_ADMIN') || hasRole('ROLE_VOLUNTEER')

  // Queries
  const { data: myListings, isLoading: loadingListings } = useQuery({
    queryKey: ['animals', 'my-listings'],
    queryFn: animalsApi.getMyListings,
    staleTime: 60 * 1000,
  })

  const { data: myAdoptions, isLoading: loadingAdoptions } = useQuery({
    queryKey: ['adoptions', 'my'],
    queryFn: adoptionsApi.getMy,
    staleTime: 60 * 1000,
  })

  const { data: adminAdoptions, isLoading: loadingAdminAdoptions } = useQuery({
    queryKey: ['adoptions', 'admin'],
    queryFn: () => adoptionsApi.getAll(),
    enabled: isAdminOrVolunteer,
    staleTime: 30 * 1000,
  })

  // Mutations
  const cancelMutation = useMutation({
    mutationFn: (id: number) => adoptionsApi.cancel(id),
    onSuccess: () => {
      toast.success('Adoption request cancelled successfully.')
      queryClient.invalidateQueries({ queryKey: ['adoptions', 'my'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to cancel adoption request.')
    },
  })

  const reviewMutation = useMutation({
    mutationFn: ({ id, decision }: { id: number; decision: 'APPROVED' | 'REJECTED' }) =>
      adoptionsApi.review(id, {
        decision,
        reviewNote: reviewNote[id] || '',
      }),
    onSuccess: () => {
      toast.success('Adoption request reviewed successfully.')
      setReviewingId(null)
      queryClient.invalidateQueries({ queryKey: ['adoptions', 'admin'] })
      queryClient.invalidateQueries({ queryKey: ['animals'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit review.')
    },
  })

  return (
    <div className="pt-20 min-h-screen bg-cream-100 pb-16">
      {/* Top Welcome Panel */}
      <div className="bg-dark-green py-12 text-white">
        <div className="container-max flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl">Hello, {user?.username}</h1>
            <p className="text-sage-200 mt-2 text-sm">
              Welcome to your dashboard. Manage your animal postings and adoption requests here.
            </p>
          </div>
          <Link
            to="/animals/post"
            className="flex items-center gap-2 px-5 py-3 bg-orange-400 hover:bg-orange-300 text-white font-semibold rounded-xl transition-all shadow-sm"
          >
            <PlusCircle className="w-5 h-5" />
            Post Stray Animal
          </Link>
        </div>
      </div>

      <div className="container-max mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Columns */}
        <div className="lg:col-span-2 space-y-10">

          {/* 1. Admin/Volunteer Review Panel */}
          {isAdminOrVolunteer && (
            <div className="bg-white rounded-2xl p-6 border border-sage-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-orange-500">
                <ShieldAlert className="w-5 h-5" />
                <h2 className="font-serif text-2xl text-brown-800">Pending Reviews (Admin/Volunteer)</h2>
              </div>

              {loadingAdminAdoptions ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="skeleton h-24 w-full" />
                  ))}
                </div>
              ) : !adminAdoptions?.content.length ? (
                <p className="text-brown-500 text-sm py-4">No adoption requests currently require review.</p>
              ) : (
                <div className="divide-y divide-sage-100">
                  {adminAdoptions.content.map((req) => (
                    <div key={req.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={resolveImageUrl(req.animalImageUrl)}
                            alt={req.animalName}
                            className="w-14 h-14 object-cover rounded-xl bg-cream-200"
                          />
                          <div>
                            <h3 className="font-semibold text-brown-800">{req.animalName}</h3>
                            <p className="text-xs text-brown-500 mt-0.5">
                              Requested by: <span className="font-medium text-brown-700">{req.requesterUsername}</span>
                            </p>
                            {req.message && (
                              <p className="text-xs text-brown-600 italic mt-1.5 bg-cream-50 p-2 rounded-lg border border-cream-200 max-w-md">
                                "{req.message}"
                              </p>
                            )}
                          </div>
                        </div>

                        {req.status === 'PENDING' ? (
                          <div className="flex flex-col items-end gap-2">
                            {reviewingId === req.id ? (
                              <div className="flex flex-col gap-2 w-full sm:w-auto">
                                <input
                                  type="text"
                                  placeholder="Add a review note..."
                                  value={reviewNote[req.id] || ''}
                                  onChange={(e) =>
                                    setReviewNote((prev) => ({ ...prev, [req.id]: e.target.value }))
                                  }
                                  className="px-3 py-1.5 rounded-lg border border-sage-200 text-xs text-brown-700 focus:outline-none focus:ring-1 focus:ring-forest-400"
                                />
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() =>
                                      reviewMutation.mutate({ id: req.id, decision: 'APPROVED' })
                                    }
                                    disabled={reviewMutation.isPending}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-forest-500 hover:bg-forest-600 text-white rounded-lg text-xs font-semibold"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Approve
                                  </button>
                                  <button
                                    onClick={() =>
                                      reviewMutation.mutate({ id: req.id, decision: 'REJECTED' })
                                    }
                                    disabled={reviewMutation.isPending}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold"
                                  >
                                    <X className="w-3.5 h-3.5" /> Reject
                                  </button>
                                  <button
                                    onClick={() => setReviewingId(null)}
                                    className="px-2.5 py-1.5 border border-sage-200 hover:bg-cream-100 text-brown-600 rounded-lg text-xs"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setReviewingId(req.id)}
                                className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-xs font-semibold rounded-lg"
                              >
                                Review Request
                              </button>
                            )}
                          </div>
                        ) : (
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              ADOPTION_STATUS_CONFIG[req.status]?.className || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {ADOPTION_STATUS_CONFIG[req.status]?.label || req.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. My Adoption Requests */}
          <div className="bg-white rounded-2xl p-6 border border-sage-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-forest-600">
              <Heart className="w-5 h-5 fill-forest-600" />
              <h2 className="font-serif text-2xl text-brown-800">My Adoption Requests</h2>
            </div>

            {loadingAdoptions ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="skeleton h-20 w-full" />
                ))}
              </div>
            ) : !myAdoptions?.length ? (
              <div className="text-center py-8">
                <p className="text-brown-500 text-sm">You haven't requested to adopt any animals yet.</p>
                <Link to="/animals" className="text-forest-600 font-semibold text-xs mt-2 inline-block hover:underline">
                  Find an animal to adopt →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-sage-100">
                {myAdoptions.map((req) => (
                  <div key={req.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={resolveImageUrl(req.animalImageUrl)}
                        alt={req.animalName}
                        className="w-14 h-14 object-cover rounded-xl bg-cream-200"
                      />
                      <div>
                        <h3 className="font-semibold text-brown-800 hover:text-forest-600 transition-colors">
                          <Link to={`/animals/${req.animalId}`}>{req.animalName}</Link>
                        </h3>
                        <p className="text-xs text-brown-400 mt-0.5">Requested {formatDate(req.requestedAt)}</p>
                        {req.reviewNote && (
                          <p className="text-xs text-brown-600 mt-1 bg-cream-50 p-2 rounded border border-cream-200 max-w-sm">
                            <span className="font-semibold text-brown-700">Reviewer Note: </span>
                            "{req.reviewNote}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          ADOPTION_STATUS_CONFIG[req.status]?.className || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {ADOPTION_STATUS_CONFIG[req.status]?.label || req.status}
                      </span>
                      {req.status === 'PENDING' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this request?')) {
                              cancelMutation.mutate(req.id)
                            }
                          }}
                          disabled={cancelMutation.isPending}
                          className="text-xs text-red-500 hover:text-red-700 transition-colors"
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Listings */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-sage-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-brown-800">
              <FileText className="w-5 h-5 text-forest-500" />
              <h2 className="font-serif text-xl font-semibold">My Postings</h2>
            </div>

            {loadingListings ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-16 w-full" />
                ))}
              </div>
            ) : !myListings?.length ? (
              <div className="text-center py-6">
                <p className="text-brown-500 text-sm">You haven't posted any animals yet.</p>
                <Link to="/animals/post" className="text-forest-600 font-semibold text-xs mt-2 inline-block hover:underline">
                  Post a stray animal now →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myListings.map((animal) => (
                  <div key={animal.id} className="flex items-center gap-3 p-2 hover:bg-cream-50 rounded-xl transition-colors">
                    <img
                      src={resolveImageUrl(animal.images[0]?.imageUrl)}
                      alt={animal.name}
                      className="w-12 h-12 object-cover rounded-lg bg-cream-200"
                    />
                    <div className="flex-1 min-w-0">
                      <Link to={`/animals/${animal.id}`} className="block font-medium text-brown-800 hover:text-forest-600 transition-colors truncate">
                        {animal.name}
                      </Link>
                      <span className="text-xs text-brown-400 capitalize">{animal.category.toLowerCase()} · {animal.status.toLowerCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
