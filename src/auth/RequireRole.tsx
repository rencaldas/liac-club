import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { hasAuditAccess } from './roles'

/** Blocks the 2 non-audit roles from the team-management and audit-history screens. */
export function RequireRole() {
  const { session } = useAuth()

  if (!session || !hasAuditAccess(session.role)) {
    return <Navigate to="/portal-liac/novidades" replace />
  }

  return <Outlet />
}
