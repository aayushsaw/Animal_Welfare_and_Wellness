import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  PlusCircle, Heart, FileText, Check, X, ShieldAlert, 
  Users, Lock, Unlock, Trash2, Mail, AlertTriangle, Loader2 
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { animalsApi } from '@/api/animals.api'
import { adoptionsApi } from '@/api/adoptions.api'
import { usersApi } from '@/api/users.api'
import { useAuthStore } from '@/store/auth.store'
import { resolveImageUrl, ADOPTION_STATUS_CONFIG, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

export function DashboardPage() {
  const { user, hasRole } = useAuthStore()
  const queryClient = useQueryClient()
  
  const isAdmin = hasRole('ROLE_ADMIN')
  const isVolunteer = hasRole('ROLE_VOLUNTEER')
  const isAdminOrVolunteer = isAdmin || isVolunteer

  // Tab State
  const [activeTab, setActiveTab] = useState<'activity' | 'reviews' | 'users'>(
    isAdminOrVolunteer ? 'reviews' : 'activity'
  )
  const [reviewNote, setReviewNote] = useState<Record<number, string>>({})
  const [reviewingId, setReviewingId] = useState<number | null>(null)
  
  // Custom user deletion state
  const [deleteUserConfirmId, setDeleteUserConfirmId] = useState<number | null>(null)

  // ── Queries ──
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

  const { data: pendingListings, isLoading: loadingPendingListings } = useQuery({
    queryKey: ['animals', 'pending'],
    queryFn: animalsApi.getPending,
    enabled: isAdminOrVolunteer,
    staleTime: 30 * 1000,
  })

  const { data: usersList, isLoading: loadingUsers } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: usersApi.getAll,
    enabled: isAdmin,
    staleTime: 30 * 1000,
  })

  // ── Mutations ──
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

  const approveListingMutation = useMutation({
    mutationFn: (id: number) => animalsApi.approve(id),
    onSuccess: () => {
      toast.success('Animal listing approved successfully.')
      queryClient.invalidateQueries({ queryKey: ['animals', 'pending'] })
      queryClient.invalidateQueries({ queryKey: ['animals'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to approve listing.')
    },
  })

  const rejectListingMutation = useMutation({
    mutationFn: (id: number) => animalsApi.delete(id),
    onSuccess: () => {
      toast.success('Animal listing rejected and removed.')
      queryClient.invalidateQueries({ queryKey: ['animals', 'pending'] })
      queryClient.invalidateQueries({ queryKey: ['animals'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to reject listing.')
    },
  })

  const suspendUserMutation = useMutation({
    mutationFn: (id: number) => usersApi.suspend(id),
    onSuccess: () => {
      toast.success('User suspended successfully.')
      queryClient.invalidateQueries({ queryKey: ['users', 'all'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to suspend user.')
    },
  })

  const activateUserMutation = useMutation({
    mutationFn: (id: number) => usersApi.activate(id),
    onSuccess: () => {
      toast.success('User activated successfully.')
      queryClient.invalidateQueries({ queryKey: ['users', 'all'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to activate user.')
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      toast.success('User account removed permanently.')
      setDeleteUserConfirmId(null)
      queryClient.invalidateQueries({ queryKey: ['users', 'all'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete user.')
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
              Manage stray rescue listings, review incoming adoption applications, and control membership profiles.
            </p>
          </div>
          <Link
            to="/animals/post"
            className="flex items-center gap-2 px-5 py-3 bg-orange-400 hover:bg-orange-300 text-white font-semibold rounded-xl transition-all shadow-sm"
          >
            <PlusCircle className="w-5 h-5" />
            Post Rescued Animal
          </Link>
        </div>
      </div>

      {/* Navigation Tabs (Dynamic based on privileges) */}
      <div className="border-b border-sage-100/60 bg-white shadow-xs">
        <div className="container-max flex gap-4 md:gap-6">
          {isAdminOrVolunteer && (
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-2 border-b-2 text-sm font-semibold transition-all ${
                activeTab === 'reviews' 
                  ? 'border-forest-500 text-forest-700' 
                  : 'border-transparent text-brown-400 hover:text-brown-600'
              }`}
            >
              Pending Reviews
            </button>
          )}
          
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-4 px-2 border-b-2 text-sm font-semibold transition-all ${
              activeTab === 'activity' 
                ? 'border-forest-500 text-forest-700' 
                : 'border-transparent text-brown-400 hover:text-brown-600'
            }`}
          >
            My Activity
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-2 border-b-2 text-sm font-semibold transition-all ${
                activeTab === 'users' 
                  ? 'border-forest-500 text-forest-700' 
                  : 'border-transparent text-brown-400 hover:text-brown-600'
              }`}
            >
              User Management
            </button>
          )}
        </div>
      </div>

      <div className="container-max mt-8">
        
        {/* ── Tab Content: Reviews ── */}
        {activeTab === 'reviews' && isAdminOrVolunteer && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              
              {/* Adoption Applications Review */}
              <div className="bg-white rounded-2xl p-6 border border-sage-100 shadow-sm space-y-6">
                <div className="flex items-center gap-2 text-orange-500 pb-2 border-b border-sage-50">
                  <ShieldAlert className="w-5 h-5" />
                  <h2 className="font-serif text-xl font-bold text-brown-800">Pending Adoption Applications</h2>
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
                              src={resolveImageUrl(req.primaryImageUrl)}
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
                                    placeholder="Add review feedback..."
                                    value={reviewNote[req.id!] || ''}
                                    onChange={(e) =>
                                      setReviewNote((prev) => ({ ...prev, [req.id!]: e.target.value }))
                                    }
                                    className="px-3 py-1.5 rounded-lg border border-sage-200 text-xs text-brown-700 focus:outline-none"
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={() =>
                                        reviewMutation.mutate({ id: req.id!, decision: 'APPROVED' })
                                      }
                                      disabled={reviewMutation.isPending}
                                      className="flex items-center gap-1 px-3 py-1.5 bg-forest-500 hover:bg-forest-600 text-white rounded-lg text-xs font-semibold"
                                    >
                                      <Check className="w-3.5 h-3.5" /> Approve
                                    </button>
                                    <button
                                      onClick={() =>
                                        reviewMutation.mutate({ id: req.id!, decision: 'REJECTED' })
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
                                  onClick={() => setReviewingId(req.id!)}
                                  className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-xs font-semibold rounded-lg"
                                >
                                  Review Request
                                </button>
                              )}
                            </div>
                          ) : (
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                ADOPTION_STATUS_CONFIG[req.status!]?.className || 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {ADOPTION_STATUS_CONFIG[req.status!]?.label || req.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Listings Moderation */}
              <div className="bg-white rounded-2xl p-6 border border-sage-100 shadow-sm space-y-6">
                <div className="flex items-center gap-2 text-forest-600 pb-2 border-b border-sage-50">
                  <ShieldAlert className="w-5 h-5" />
                  <h2 className="font-serif text-xl font-bold text-brown-800">Postings Awaiting Verification</h2>
                </div>

                {loadingPendingListings ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="skeleton h-20 w-full" />
                    ))}
                  </div>
                ) : !pendingListings?.length ? (
                  <p className="text-brown-500 text-sm py-2">No postings currently require verification.</p>
                ) : (
                  <div className="divide-y divide-sage-100">
                    {pendingListings.map((animal) => (
                      <div key={animal.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={resolveImageUrl(animal.primaryImageUrl)}
                              alt={animal.name}
                              className="w-14 h-14 object-cover rounded-xl bg-cream-200"
                            />
                            <div>
                              <h3 className="font-semibold text-brown-800">
                                <Link to={`/animals/${animal.id}`} className="hover:text-forest-600">{animal.name}</Link>
                              </h3>
                              <p className="text-xs text-brown-500 mt-0.5">
                                Posted by: <span className="font-semibold text-brown-600">{animal.postedBy?.fullName || animal.postedBy?.username}</span> | Date: {formatDate(animal.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => approveListingMutation.mutate(animal.id!)}
                              disabled={approveListingMutation.isPending}
                              className="flex items-center gap-1 px-3 py-1.5 bg-forest-500 hover:bg-forest-600 text-white rounded-lg text-xs font-semibold"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to reject and delete this listing?')) {
                                  rejectListingMutation.mutate(animal.id!)
                                }
                              }}
                              disabled={rejectListingMutation.isPending}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Statistics Sidebar Panel */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-sage-100 shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold text-brown-800 border-b border-sage-50 pb-2">Moderation Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-cream-50 rounded-xl text-center">
                    <span className="text-2xl font-bold text-brown-800">{pendingListings?.length ?? 0}</span>
                    <span className="block text-[10px] uppercase font-bold text-brown-400 mt-1">Pending Strays</span>
                  </div>
                  <div className="p-3 bg-cream-50 rounded-xl text-center">
                    <span className="text-2xl font-bold text-brown-800">
                      {adminAdoptions?.content.filter(a => a.status === 'PENDING').length ?? 0}
                    </span>
                    <span className="block text-[10px] uppercase font-bold text-brown-400 mt-1">Adoption Reviews</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab Content: Activity ── */}
        {activeTab === 'activity' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              
              {/* Adoption Requests Sent */}
              <div className="bg-white rounded-2xl p-6 border border-sage-100 shadow-sm space-y-6">
                <div className="flex items-center gap-2 text-forest-600 pb-2 border-b border-sage-50">
                  <Heart className="w-5 h-5 fill-forest-600" />
                  <h2 className="font-serif text-xl font-bold text-brown-800">My Adoption Applications</h2>
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
                            src={resolveImageUrl(req.primaryImageUrl)}
                            alt={req.animalName}
                            className="w-14 h-14 object-cover rounded-xl bg-cream-200"
                          />
                          <div>
                            <h3 className="font-semibold text-brown-800 hover:text-forest-600 transition-colors">
                              <Link to={`/animals/${req.animalId!}`}>{req.animalName}</Link>
                            </h3>
                            <p className="text-xs text-brown-400 mt-0.5">Requested {formatDate(req.createdAt)}</p>
                            {req.reviewNote && (
                              <p className="text-xs text-brown-600 mt-1 bg-cream-50 p-2 rounded border border-cream-200 max-w-sm">
                                <span className="font-semibold text-brown-700">Review Note: </span>
                                "{req.reviewNote}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              ADOPTION_STATUS_CONFIG[req.status!]?.className || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {ADOPTION_STATUS_CONFIG[req.status!]?.label || req.status}
                          </span>
                          {req.status === 'PENDING' && (
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to cancel this request?')) {
                                  cancelMutation.mutate(req.id!)
                                }
                              }}
                              disabled={cancelMutation.isPending}
                              className="text-xs text-red-500 hover:text-red-700 transition-colors font-medium"
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

            {/* My Postings Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-sage-100 shadow-sm space-y-6">
                <div className="flex items-center gap-2 text-brown-800 pb-2 border-b border-sage-50">
                  <FileText className="w-5 h-5 text-forest-500" />
                  <h2 className="font-serif text-lg font-semibold">My Rescue Postings</h2>
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
                          <span className="text-[10px] text-brown-400 capitalize">{animal.category.toLowerCase()} · {animal.status.toLowerCase()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab Content: User Management (Admin Only) ── */}
        {activeTab === 'users' && isAdmin && (
          <div className="bg-white rounded-2xl p-6 border border-sage-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-sage-50">
              <div className="flex items-center gap-2 text-forest-600">
                <Users className="w-5 h-5" />
                <h2 className="font-serif text-xl font-bold text-brown-800">User Management</h2>
              </div>
              <span className="text-xs text-brown-500 font-semibold">{usersList?.length ?? 0} members registered</span>
            </div>

            {loadingUsers ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-14 w-full" />
                ))}
              </div>
            ) : !usersList?.length ? (
              <p className="text-brown-500 text-sm py-4">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-sage-100 text-brown-400 uppercase tracking-wider font-bold">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Roles</th>
                      <th className="py-3 px-4">Joined</th>
                      <th className="py-3 px-4">Stats</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage-50 text-brown-700 font-medium">
                    {usersList.map((usr) => {
                      const userIsSelf = usr.username === user?.username
                      const userIsAdmin = usr.roles.includes('ADMIN')

                      return (
                        <tr key={usr.id} className="hover:bg-cream-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-brown-800">{usr.firstName} {usr.lastName}</div>
                            <div className="text-[10px] text-brown-400">@{usr.username} {userIsSelf && '(you)'}</div>
                          </td>
                          <td className="py-3 px-4 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-sage-400" />
                            {usr.email}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              {usr.roles.map((role) => (
                                <span key={role} className="px-2 py-0.5 rounded-md bg-sage-100 text-sage-700 text-[10px] uppercase font-bold">
                                  {role}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-brown-400">
                            {formatDate(usr.createdAt)}
                          </td>
                          <td className="py-3 px-4 space-y-0.5 text-brown-500 text-[10px]">
                            <div>Strays: {usr.animalsPosted}</div>
                            <div>Adoptions: {usr.adoptionsCompleted}</div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              {usr.accountLocked ? (
                                <button
                                  onClick={() => activateUserMutation.mutate(usr.id)}
                                  disabled={activateUserMutation.isPending}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-forest-50 text-forest-600 border border-forest-200 rounded-lg"
                                  title="Activate user account"
                                >
                                  <Unlock className="w-3.5 h-3.5" />
                                  <span>Activate</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => suspendUserMutation.mutate(usr.id)}
                                  disabled={suspendUserMutation.isPending || userIsSelf || userIsAdmin}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-orange-50 text-orange-600 border border-orange-200 rounded-lg disabled:opacity-40"
                                  title="Suspend user account"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Suspend</span>
                                </button>
                              )}

                              <button
                                onClick={() => setDeleteUserConfirmId(usr.id)}
                                disabled={deleteUserMutation.isPending || userIsSelf || userIsAdmin}
                                className="flex items-center justify-center p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 disabled:opacity-40"
                                title="Remove user permanently"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── User Deletion Confirmation Modal ── */}
      {deleteUserConfirmId !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-sage-100 max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-serif text-lg font-bold">Remove User Permanently?</h3>
            </div>
            <p className="text-xs text-brown-500 leading-relaxed">
              Are you sure you want to permanently delete this user account? This action checks constraint validations and removes database profiles.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteUserConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-sage-200 text-brown-600 text-xs font-semibold hover:bg-cream-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteUserMutation.mutate(deleteUserConfirmId)}
                disabled={deleteUserMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                {deleteUserMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
