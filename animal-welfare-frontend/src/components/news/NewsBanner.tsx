import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { newsApi } from '@/api/news.api'
import { resolveImageUrl, formatDate } from '@/lib/utils'

export function NewsBanner() {
  const [current, setCurrent] = useState(0)

  const { data: articles = [] } = useQuery({
    queryKey: ['news', 'featured'],
    queryFn: newsApi.getFeatured,
    staleTime: 5 * 60 * 1000,
  })

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % articles.length)
  }, [articles.length])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + articles.length) % articles.length)
  }, [articles.length])

  // Auto-advance every 5s
  useEffect(() => {
    if (articles.length <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [articles.length, next])

  if (!articles.length) return null

  const article = articles[current]

  return (
    <section className="relative h-[420px] md:h-[480px] overflow-hidden rounded-2xl bg-dark-green">
      {/* Background image */}
      <div className="absolute inset-0 transition-opacity duration-700">
        <img
          src={resolveImageUrl(article.imageUrl)}
          alt={article.title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 hero-overlay" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6 md:p-10">
        <span className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-semibold bg-orange-300/90 text-orange-900 w-fit">
          {article.category}
        </span>
        <h3 className="font-serif text-white text-xl md:text-2xl lg:text-3xl font-semibold leading-tight max-w-2xl text-balance">
          {article.title}
        </h3>
        <p className="mt-2 text-sage-200 text-sm md:text-base line-clamp-2 max-w-xl">
          {article.summary}
        </p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <span className="text-sage-300 text-xs">{formatDate(article.publishedAt)}</span>
            <Link
              to={`/news/${article.id}`}
              className="text-xs font-semibold text-white bg-forest-500 hover:bg-forest-400 px-4 py-1.5 rounded-full transition-colors"
            >
              Read more
            </Link>
          </div>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {articles.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all ${
                  i === current ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Arrows */}
      {articles.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </section>
  )
}
