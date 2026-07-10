import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, Search, PawPrint } from 'lucide-react'
import { animalsApi } from '@/api/animals.api'
import { AnimalCard } from '@/components/animals/AnimalCard'
import type { AnimalCategory } from '@/types/animal'
import { usePageTitle } from '@/lib/usePageTitle'

const CATEGORIES: { value: AnimalCategory | 'ALL'; label: string; emoji: string }[] = [
  { value: 'ALL',    label: 'All Animals', emoji: '🐾' },
  { value: 'DOG',    label: 'Dogs',        emoji: '🐶' },
  { value: 'CAT',    label: 'Cats',        emoji: '🐱' },
  { value: 'BIRD',   label: 'Birds',       emoji: '🐦' },
  { value: 'RABBIT', label: 'Rabbits',     emoji: '🐰' },
  { value: 'OTHER',  label: 'Other',       emoji: '🐾' },
]

const PAGE_SIZE = 12

export function AnimalsPage() {
  usePageTitle('Find a Pet')
  const [category, setCategory] = useState<AnimalCategory | 'ALL'>('ALL')
  const [page, setPage]         = useState(0)

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

      {/* ── Page Header ── */}
      <div className="bg-dark-green py-14">
        <div className="container-max">
          <div className="flex items-center gap-3 text-sage-300 mb-3 text-xs font-bold uppercase tracking-widest">
            <PawPrint className="w-4 h-4" />
            Stray Animal Directory
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">
            Find Your Companion
          </h1>
          <p className="mt-3 text-sage-200 max-w-xl text-sm leading-relaxed">
            Every animal listed here has been rescued and verified by our community volunteers.
            Browse, filter, and give a stray a second chance.
          </p>
        </div>
      </div>

      <div className="container-max py-10">

        {/* ── Filter Bar ── */}
        <div className="flex flex-wrap items-center gap-2.5 mb-10">
          <span className="flex items-center gap-1.5 text-brown-500 text-xs font-bold uppercase tracking-wider mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filter
          </span>

          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              data-testid={`category-filter-${cat.value.toLowerCase()}`}
              className={`
                inline-flex items-center gap-1.5
                px-4 py-2 rounded-full text-sm font-semibold
                border transition-all duration-200
                ${category === cat.value
                  ? 'bg-forest-600 text-white border-forest-600 shadow-sm'
                  : 'bg-white text-brown-600 border-sage-200 hover:border-forest-400 hover:text-forest-700 hover:bg-forest-50'
                }
              `}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}

          {/* Result count */}
          {data && (
            <span className="ml-auto text-xs text-brown-400 font-semibold">
              {data.totalElements} {data.totalElements === 1 ? 'animal' : 'animals'} found
            </span>
          )}
        </div>

        {/* ── Loading Skeleton Grid ── */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-sage-100 shadow-sm">
                {/* Image skeleton — must match the real 4:3 aspect ratio */}
                <div className="w-full animate-pulse bg-cream-200" style={{ aspectRatio: '4/3' }} />
                <div className="p-4 space-y-3">
                  <div className="flex justify-between gap-2">
                    <div className="skeleton h-4 w-2/3" />
                    <div className="skeleton h-4 w-10" />
                  </div>
                  <div className="skeleton h-3 w-1/2" />
                  <div className="skeleton h-3 w-full" />
                  <div className="border-t border-sage-100 pt-3 flex justify-between">
                    <div className="skeleton h-3 w-1/3" />
                    <div className="skeleton h-3 w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty State ── */}
        {!isLoading && data?.content.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-sage-50 border border-sage-200 flex items-center justify-center">
              <Search className="w-8 h-8 text-sage-300" />
            </div>
            <h3 className="font-serif text-xl text-brown-700">No animals found</h3>
            <p className="text-brown-400 text-sm max-w-xs leading-relaxed">
              No animals matched the selected filter. Try a different category or check back later.
            </p>
            <button
              onClick={() => handleCategoryChange('ALL')}
              className="mt-2 px-5 py-2.5 bg-forest-600 hover:bg-forest-500 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Show All Animals
            </button>
          </div>
        )}

        {/* ── Animal Grid ── */}
        {!isLoading && data && data.content.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.content.map((animal) => (
              <AnimalCard key={animal.id} animal={animal} />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-14">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={data.first}
              className="
                px-5 py-2.5 rounded-xl border border-sage-200
                text-brown-600 text-sm font-semibold
                disabled:opacity-40 disabled:pointer-events-none
                hover:bg-forest-50 hover:border-forest-300 hover:text-forest-700
                transition-all
              "
            >
              ← Previous
            </button>

            <span className="px-4 py-2.5 text-xs font-bold text-brown-400 uppercase tracking-wider">
              Page {page + 1} of {data.totalPages}
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={data.last}
              className="
                px-5 py-2.5 rounded-xl border border-sage-200
                text-brown-600 text-sm font-semibold
                disabled:opacity-40 disabled:pointer-events-none
                hover:bg-forest-50 hover:border-forest-300 hover:text-forest-700
                transition-all
              "
            >
              Next →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
