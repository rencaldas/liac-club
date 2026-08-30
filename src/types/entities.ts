export interface NewsItem {
  slug: string
  title: string
  publishedAt: string
  category: string
  summary: string
  content: string
  coverImageUrl?: string
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
}

export interface ScientificArticle {
  slug: string
  title: string
  authors: string[]
  abstract: string
  tags: string[]
  externalUrl: string
}

export type ResearchProjectStatus = 'ativo' | 'concluído'

export interface ResearchProject {
  id: string
  title: string
  status: ResearchProjectStatus
  summary: string
  members: string[]
}

export type SocialPlatform = 'instagram' | 'linkedin'

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

export interface ContactFormPayload {
  name: string
  email: string
  phone: string
  preferredContactTime: string
  message: string
}

export type ContactFormErrors = Partial<Record<keyof ContactFormPayload, string>>
