import type { StaffRole } from '../types/entities'

export const AUDIT_ROLES: StaffRole[] = ['diretor_marketing', 'presidente', 'vice_presidente']

export const ALL_ROLES: StaffRole[] = [
  'diretor_marketing',
  'presidente',
  'vice_presidente',
  'coordenador',
  'diretor_eventos',
]

export const ROLE_LABELS: Record<StaffRole, string> = {
  diretor_marketing: 'Diretor de Marketing',
  presidente: 'Presidente',
  vice_presidente: 'Vice-Presidente',
  coordenador: 'Coordenador',
  diretor_eventos: 'Diretor de Eventos',
}

export function hasAuditAccess(role: StaffRole): boolean {
  return AUDIT_ROLES.includes(role)
}
