import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { hasAuditAccess } from './roles'
import type { StaffRole } from '../types/entities'

interface RequireRoleProps {
  /** Which roles may pass. Defaults to the audit roles (team-management, audit-history screens). */
  check?: (role: StaffRole) => boolean
}

export function RequireRole({ check = hasAuditAccess }: RequireRoleProps) {
  const { session } = useAuth()

  if (!session || !check(session.role)) {
    return <Navigate to="/portal-liac/novidades" replace />
  }

  return <Outlet />
}
