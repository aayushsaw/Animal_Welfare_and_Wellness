import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { newsApi } from '@/api/news.api'
import { resolveImageUrl, formatDate, NEWS_CATEGORY_LABELS } from '@/lib/utils'

export function NewsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: () => newsApi.getAll({ size: 20 }),
    staleTime: 5 * 60 * 1000,
  })

  return (
    <div className="pt-20 min-h-screen bg-cream-100 pb-16">
      {/* Header */}
      <div className="bg-dark-green py-14">
        <div className="container-max">
          <h1 className="font-serif text-4xl md:text-5xl text-white font-bold">Welfare News & Updates</h1>
          <p className="mt-3 text-sage-200 max-w-xl">
            Stay informed about local rescue operations, vaccination drives, awareness campaigns, and success stories.
          </p>
        </div>
      </div>

      <div className="container-max py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-sage-100 shadow-sm">
                <div className="skeleton h-48 w-full" />
                <div className="p-5 space-y-3">
                  <div className="skeleton h-4 w-1/4" />
                  <div className="skeleton h-6 w-3/4" />
                  <div className="skeleton h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : !data?.content.length ? (
          <div className="text-center py-20">
            <p className="text-brown-500 text-lg">No news articles found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.content.map((art) => (
              <Link
                key={art.id}
                to={`/news/${art.id}`}
                className="group block bg-white rounded-2xl overflow-hidden border border-sage-100 shadow-sm card-hover"
              >
                <div className="relative h-48 bg-cream-200 overflow-hidden">
                  <img
                    src={resolveImageUrl(art.imageUrl)}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-300 text-orange-900 shadow-sm">
                    {NEWS_CATEGORY_LABELS[art.category] ?? art.category}
                  </span>
                </div>

                <div className="p-5">
                  <span className="text-xs text-brown-400 font-medium block mb-1.5">
                    {formatDate(art.publishDate)}
                  </span>
                  <h3 className="font-serif text-lg text-brown-800 font-semibold group-hover:text-forest-600 transition-colors leading-snug line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="mt-2 text-brown-500 text-sm line-clamp-3 leading-relaxed">
                    {art.summary}
                  </p>
                  <div className="mt-4 pt-4 border-t border-sage-100 flex justify-between items-center text-xs font-semibold text-forest-600">
                    <span>Read Article →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
