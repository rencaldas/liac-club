import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function RequireAuth() {
  const { session } = useAuth()
  const location = useLocation()

  if (!session) {
    return <Navigate to="/portal-equipe/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
