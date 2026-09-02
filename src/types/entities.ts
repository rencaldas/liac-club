export interface NewsItem {
  slug: string
  title: string
  publishedAt: string
  category: string
  summary: string
  content: string
  coverImageUrl?: string
  featured?: boolean
}

export type EventType = 'workshop' | 'congresso' | 'palestra'

export interface Event {
  slug: string
  title: string
  startDate: string
  endDate: string
  location: string
  type: EventType
  description: string
  coverImageUrl?: string
  featured?: boolean
}

export interface ScientificArticle {
  slug: string
  title: string
  publishedAt: string
  authors: string[]
  abstract: string
  tags: string[]
  externalUrl: string
  featured?: boolean
}

export type ResearchProjectStatus = 'ativo' | 'concluído'

export interface ResearchProject {
  id: string
  title: string
  status: ResearchProjectStatus
  summary: string
  members: string[]
  /** ISO "YYYY-MM-DD". Optional until the backend (liac-backend) adds the column. */
  publishedAt?: string
}

export interface SymposiumEdition {
  slug: string
  title: string
  year: number
  startDate: string
  endDate: string
  location: string
  description: string
  coverImageUrl?: string
  externalUrl?: string
  featured?: boolean
}

export type SocialPlatform = 'instagram' | 'linkedin' | 'github'

export interface SocialLink {
  platform: SocialPlatform
  url: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  area: string
  photoUrl?: string
  socialLinks: SocialLink[]
}

export interface Partner {
  id: string
  name: string
  logoUrl: string
  externalUrl: string
  tier?: string
}

/** A ligante's feedback about their experience in LIAC, shown as the last carousel on the home page. */
export interface Testimonial {
  id: string
  name: string
  text: string
}

export interface StaffCredentials {
  email: string
  password: string
}

export type StaffRole =
  | 'desenvolvedor'
  | 'diretor_marketing'
  | 'presidente'
  | 'vice_presidente'
  | 'coordenador'
  | 'diretor_eventos'

export interface AuthSession {
  token: string
  role: StaffRole
  displayName: string
  id?: string
  email?: string
  photoUrl?: string
  area?: string
  socialLinks?: SocialLink[]
}

export interface StaffMember {
  id: string
  displayName: string
  role: StaffRole
  email: string
  photoUrl?: string
  area?: string
  socialLinks?: SocialLink[]
}

/** Everything a collaborator can edit about themselves — role is fixed, only management can change it (see RequireRole). */
export interface UpdateProfilePayload {
  displayName: string
  email: string
  photoUrl?: string
  area?: string
  socialLinks?: SocialLink[]
}

export interface InvitePayload {
  email: string
  displayName: string
  role: StaffRole
  redirectTo: string
}

export type AuditAction = 'create' | 'update' | 'delete' | 'feature' | 'unfeature'
export type AuditEntityType = 'news' | 'event' | 'article' | 'partner'

export interface AuditLogEntry {
  id: string
  author: string
  timestamp: string
  action: AuditAction
  entityType: AuditEntityType
  entityLabel: string
}

/** Activity counters shown in the site footer — served by `GET /stats` as plain numbers (no rows). */
export interface SiteStats {
  members: number
  pastEvents: number
  articles: number
}

export interface ContactFormPayload {
  name: string
  email: string
  phone: string
  preferredContactTime: string
  message: string
}

export type ContactFormErrors = Partial<Record<keyof ContactFormPayload, string>>
