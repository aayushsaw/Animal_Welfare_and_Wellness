import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, Search } from 'lucide-react'
import { animalsApi } from '@/api/animals.api'
import { AnimalCard } from '@/components/animals/AnimalCard'
import type { AnimalCategory } from '@/types/animal'

const CATEGORIES: { value: AnimalCategory | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Animals' },
  { value: 'DOG', label: '🐶 Dogs' },
  { value: 'CAT', label: '🐱 Cats' },
  { value: 'BIRD', label: '🐦 Birds' },
  { value: 'RABBIT', label: '🐰 Rabbits' },
  { value: 'OTHER', label: '🐾 Other' },
]

const PAGE_SIZE = 12

export function AnimalsPage() {
  const [category, setCategory] = useState<AnimalCategory | 'ALL'>('ALL')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['animals', { category, page }],
    queryFn: () =>
      animalsApi.getAll({
        category: category === 'ALL' ? undefined : category,
        page,
        size: PAGE_SIZE,
      }),
    staleTime: 2 * 60 * 1000,
  })

  const handleCategoryChange = (cat: AnimalCategory | 'ALL') => {
    setCategory(cat)
    setPage(0)
  }

  return (
    <div className="pt-20 min-h-screen bg-cream-100">
      {/* Page header */}
      <div className="bg-dark-green py-14">
        <div className="container-max">
          <h1 className="font-serif text-4xl md:text-5xl text-white">Find Your Companion</h1>
          <p className="mt-3 text-sage-200 max-w-xl">
            Browse animals looking for loving homes. Filter by type, or scroll to explore all.
          </p>
        </div>
      </div>

      <div className="container-max py-10">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className="flex items-center gap-1.5 text-brown-500 text-sm font-medium">
            <SlidersHorizontal className="w-4 h-4" />
            Filter:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat.value
                  ? 'bg-forest-500 text-white shadow-sm'
                  : 'bg-white text-brown-600 border border-sage-200 hover:border-forest-300 hover:text-forest-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
          {data && (
            <span className="ml-auto text-sm text-brown-400">
              {data.totalElements} animals found
            </span>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-sage-100">
                <div className="skeleton h-52 w-full" />
                <div className="p-4 space-y-3">
                  <div className="skeleton h-5 w-2/3" />
                  <div className="skeleton h-4 w-1/2" />
                  <div className="skeleton h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.content.length === 0 ? (
          <div className="text-center py-24">
            <Search className="w-12 h-12 text-sage-300 mx-auto mb-4" />
            <h3 className="font-serif text-xl text-brown-700">No animals found</h3>
            <p className="text-brown-400 text-sm mt-1">Try a different category or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.content.map((animal) => (
              <AnimalCard key={animal.id} animal={animal} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={data.first}
              className="px-4 py-2 rounded-lg border border-sage-200 text-brown-600 text-sm font-medium disabled:opacity-40 hover:bg-forest-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-brown-500">
              Page {page + 1} of {data.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={data.last}
              className="px-4 py-2 rounded-lg border border-sage-200 text-brown-600 text-sm font-medium disabled:opacity-40 hover:bg-forest-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
