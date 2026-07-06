import { Component, ErrorInfo, ReactNode } from 'react'
import { Link, useRouteError } from 'react-router-dom'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return <FallbackScreen error={this.state.error} />
    }

    return this.props.children
  }
}

export function RouteErrorBoundary() {
  const error = useRouteError() as Error
  return <FallbackScreen error={error} />
}

interface FallbackProps {
  error: Error | null
}

function FallbackScreen({ error }: FallbackProps) {
  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white border border-sage-100 rounded-3xl p-8 shadow-sm text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl md:text-3xl text-brown-800 font-semibold">
            Oops! Something went wrong
          </h1>
          <p className="text-sm text-brown-500 leading-relaxed">
            Our compassionate community platform ran into an unexpected hiccup. Don't worry, your data and session are safe.
          </p>
        </div>

        {error && (
          <details className="text-left bg-cream-50 border border-sage-200 rounded-xl p-4 text-xs font-mono text-brown-600 max-h-40 overflow-y-auto cursor-pointer">
            <summary className="font-semibold select-none">Technical Details (Click to expand)</summary>
            <p className="mt-2 whitespace-pre-wrap">{error.message || String(error)}</p>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleReload}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-forest-500 hover:bg-forest-600 text-white rounded-xl font-semibold transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </button>
          <Link
            to="/"
            onClick={() => {
              // Ensure we force clear any component state
              if (window.location.pathname === '/') {
                window.location.reload()
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 border border-sage-200 hover:bg-cream-50 text-brown-700 rounded-xl font-semibold transition-colors text-sm"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
