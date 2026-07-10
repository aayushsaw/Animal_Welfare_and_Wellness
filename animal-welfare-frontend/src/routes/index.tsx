import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { HomePage } from '@/pages/HomePage'
import { AnimalsPage } from '@/pages/AnimalsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProtectedRoute } from './ProtectedRoute'
import { RouteErrorBoundary } from '@/components/common/ErrorBoundary'
import { PageLoader } from '@/components/common/PageLoader'

// Lazy-loaded pages — each becomes its own JS chunk (code splitting)
const AnimalDetailPage = lazy(() =>
  import('@/pages/AnimalDetailPage').then((m) => ({ default: m.AnimalDetailPage }))
)
const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
)
const RegisterPage = lazy(() =>
  import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage }))
)
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
)
const PostAnimalPage = lazy(() =>
  import('@/pages/PostAnimalPage').then((m) => ({ default: m.PostAnimalPage }))
)
const NewsPage = lazy(() =>
  import('@/pages/NewsPage').then((m) => ({ default: m.NewsPage }))
)
const NewsDetailPage = lazy(() =>
  import('@/pages/NewsDetailPage').then((m) => ({ default: m.NewsDetailPage }))
)
const AboutPage = lazy(() =>
  import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage }))
)

// Wraps a lazy component with a consistent Suspense boundary
function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'animals',
        element: <AnimalsPage />,
      },
      {
        // IMPORTANT: This route MUST be declared before 'animals/:id'
        // React Router v6 uses specificity ordering — a literal segment
        // wins over a param, but only when declared first in the array.
        path: 'animals/post',
        element: (
          <ProtectedRoute>
            <Lazy>
              <PostAnimalPage />
            </Lazy>
          </ProtectedRoute>
        ),
      },
      {
        path: 'animals/:id',
        element: (
          <Lazy>
            <AnimalDetailPage />
          </Lazy>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Lazy>
              <DashboardPage />
            </Lazy>
          </ProtectedRoute>
        ),
      },
      {
        path: 'news',
        element: (
          <Lazy>
            <NewsPage />
          </Lazy>
        ),
      },
      {
        path: 'news/:id',
        element: (
          <Lazy>
            <NewsDetailPage />
          </Lazy>
        ),
      },
      {
        path: 'about',
        element: (
          <Lazy>
            <AboutPage />
          </Lazy>
        ),
      },
      {
        path: 'profile',
        // Alias — profile is the dashboard in this app
        element: (
          <ProtectedRoute>
            <Lazy>
              <DashboardPage />
            </Lazy>
          </ProtectedRoute>
        ),
      },
      {
        // Proper 404 — much better UX than silently redirecting to /
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  {
    // Auth pages live outside RootLayout (no Navbar/Footer)
    path: 'login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: 'register',
    element: (
      <Suspense fallback={<PageLoader />}>
        <RegisterPage />
      </Suspense>
    ),
  },
])
