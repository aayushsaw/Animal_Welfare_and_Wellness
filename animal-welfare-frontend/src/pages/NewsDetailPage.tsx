import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { newsApi } from '@/api/news.api'
import { resolveImageUrl, formatDate, NEWS_CATEGORY_LABELS } from '@/lib/utils'

export function NewsDetailPage() {
  const { id } = useParams<{ id: string }>()
  const articleId = Number(id)

  const { data: article, isLoading } = useQuery({
    queryKey: ['news', articleId],
    queryFn: () => newsApi.getById(articleId),
    enabled: !isNaN(articleId),
  })

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen bg-cream-100 pb-16">
        <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
          <div className="skeleton h-[360px] rounded-2xl w-full" />
          <div className="skeleton h-8 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-24 w-full" />
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="pt-20 min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-2xl text-brown-700">Article not found</p>
          <Link to="/news" className="mt-4 text-forest-600 text-sm hover:underline inline-block">
            ← Back to news
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen bg-cream-100 pb-16">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link
          to="/news"
          className="inline-flex items-center gap-1.5 text-sm text-brown-500 hover:text-forest-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to news
        </Link>

        <article className="bg-white border border-sage-100 rounded-2xl p-6 md:p-10 shadow-sm space-y-6">
          {/* Cover image */}
          {article.imageUrl && (
            <div className="rounded-xl overflow-hidden h-[360px] bg-cream-50">
              <img
                src={resolveImageUrl(article.imageUrl)}
                alt={article.title}
                className="w-full h-full object-cover animate-fade-in"
              />
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-4 items-center text-xs text-brown-400 pb-4 border-b border-sage-100">
            <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 font-semibold">
              {NEWS_CATEGORY_LABELS[article.category] ?? article.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(article.publishedAt)}
            </span>
            {article.author && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                By {article.author}
              </span>
            )}
          </div>

          {/* Heading */}
          <h1 className="font-serif text-3xl md:text-4xl text-brown-800 leading-tight">
            {article.title}
          </h1>

          {/* Content */}
          <div className="prose prose-stone max-w-none text-brown-700 text-sm md:text-base leading-relaxed space-y-4 font-sans">
            {/* If content field is empty, fallback to summary */}
            {(article.content || article.summary)
              .split('\n\n')
              .map((para, index) => (
                <p key={index}>{para}</p>
              ))}
          </div>
        </article>
      </div>
    </div>
  )
}
