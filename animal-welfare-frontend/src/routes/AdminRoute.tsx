import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, hasRole } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!hasRole('ROLE_ADMIN') && !hasRole('ROLE_VOLUNTEER')) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
