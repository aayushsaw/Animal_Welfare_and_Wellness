import { Link } from 'react-router-dom'
import { Home, Search, ArrowLeft, PawPrint } from 'lucide-react'
import { usePageTitle } from '@/lib/usePageTitle'

export function NotFoundPage() {
  usePageTitle('Page Not Found')
  return (
    <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center p-6 pt-24">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Illustration */}
        <div className="relative mx-auto w-40 h-40">
          {/* Big paw */}
          <div className="absolute inset-0 flex items-center justify-center">
            <PawPrint className="w-32 h-32 text-sage-200" />
          </div>
          {/* 404 overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif font-bold text-4xl text-brown-700 drop-shadow-sm">404</span>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="font-serif text-3xl text-brown-800 font-bold">
            This page wandered off
          </h1>
          <p className="text-brown-500 text-sm leading-relaxed max-w-sm mx-auto">
            Looks like this page has gone to find its forever home. 
            Let's get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-forest-600 hover:bg-forest-500 text-white font-semibold rounded-xl transition-all shadow-sm hover:-translate-y-0.5"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/animals"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-cream-50 text-brown-700 font-semibold rounded-xl border border-sage-200 transition-all hover:-translate-y-0.5"
          >
            <Search className="w-4 h-4" />
            Browse Animals
          </Link>
        </div>

        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 text-xs text-brown-400 hover:text-brown-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Go back to previous page
        </button>
      </div>
    </div>
  )
}
