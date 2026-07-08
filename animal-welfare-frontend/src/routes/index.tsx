import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { HomePage } from '@/pages/HomePage'
import { AnimalsPage } from '@/pages/AnimalsPage'
import { ProtectedRoute } from './ProtectedRoute'
import { RouteErrorBoundary } from '@/components/common/ErrorBoundary'
import { PageLoader } from '@/components/common/PageLoader'

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
        path: 'animals/:id',
        element: <AnimalDetailPage />,
      },
      {
        path: 'animals/post',
        element: (
          <ProtectedRoute>
            <PostAnimalPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'news',
        element: <NewsPage />,
      },
      {
        path: 'news/:id',
        element: <NewsDetailPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'profile',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
  {
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
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
