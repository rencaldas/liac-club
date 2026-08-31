import type { StaffRole } from '../types/entities'

export const AUDIT_ROLES: StaffRole[] = ['diretor_marketing', 'presidente', 'vice_presidente', 'desenvolvedor']

export const ALL_ROLES: StaffRole[] = [
  'diretor_marketing',
  'presidente',
  'vice_presidente',
  'coordenador',
  'diretor_eventos',
  'desenvolvedor',
]

export const ROLE_LABELS: Record<StaffRole, string> = {
  diretor_marketing: 'Diretor de Marketing',
  presidente: 'Presidente',
  vice_presidente: 'Vice-Presidente',
  coordenador: 'Coordenador',
  diretor_eventos: 'Diretor de Eventos',
  desenvolvedor: 'Desenvolvedor',
}

export function hasAuditAccess(role: StaffRole): boolean {
  return AUDIT_ROLES.includes(role)
}

export const PARTNER_MANAGEMENT_ROLES: StaffRole[] = [
  'diretor_marketing',
  'diretor_eventos',
  'presidente',
  'vice_presidente',
  'desenvolvedor',
]

export function hasPartnerManagementAccess(role: StaffRole): boolean {
  return PARTNER_MANAGEMENT_ROLES.includes(role)
}
