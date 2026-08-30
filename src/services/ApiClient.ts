import type {
  ContactFormPayload,
  Event,
  NewsItem,
  Partner,
  ResearchProject,
  ScientificArticle,
  TeamMember,
} from '../types/entities'

export interface PaginatedResult<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface EventListParams extends PaginationParams {
  when?: 'upcoming' | 'past'
}

export interface ArticleListParams extends PaginationParams {
  tag?: string
  author?: string
}

export interface ProjectListParams extends PaginationParams {
  status?: ResearchProject['status']
}

export interface TeamListParams {
  area?: string
}

export interface PartnerListParams {
  tier?: string
}

/**
 * Abstraction consumed by pages/hooks. The only implementation in this repository is
 * MockApiClient (src/services/mock/MockApiClient.ts) — a real backend implementation is
 * expected to be swapped in later without touching any component (Constitution Princípio I).
 */
export interface ApiClient {
  getNews(params?: PaginationParams): Promise<PaginatedResult<NewsItem>>
  getNewsBySlug(slug: string): Promise<NewsItem | null>

  getEvents(params?: EventListParams): Promise<PaginatedResult<Event>>
  getEventBySlug(slug: string): Promise<Event | null>

  getArticles(params?: ArticleListParams): Promise<PaginatedResult<ScientificArticle>>
  getArticleBySlug(slug: string): Promise<ScientificArticle | null>

  getProjects(params?: ProjectListParams): Promise<PaginatedResult<ResearchProject>>

  getTeam(params?: TeamListParams): Promise<TeamMember[]>

  getPartners(params?: PartnerListParams): Promise<Partner[]>

  submitContactForm(payload: ContactFormPayload): Promise<{ status: 'received' }>
}
