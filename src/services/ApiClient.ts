import type {
  AuditLogEntry,
  AuthSession,
  ContactFormPayload,
  Event,
  InvitePayload,
  NewsItem,
  Partner,
  ResearchProject,
  ScientificArticle,
  StaffCredentials,
  StaffMember,
  StaffRole,
  SymposiumEdition,
  TeamMember,
  UpdateProfilePayload,
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

export type SymposiumEditionListParams = PaginationParams

export interface TeamListParams {
  area?: string
}

export interface PartnerListParams {
  tier?: string
}

export interface AuditLogListParams extends PaginationParams {
  author?: string
}

/**
 * Abstraction consumed by pages/hooks. The real implementation (`HybridApiClient`) composes
 * `RestApiClient` (News/Events/Articles/staff/auth — real backend, see `liac-backend`) and
 * `MockApiClient` (Projects/Team/Partners/contact form — local fixtures, no backend yet).
 */
export interface ApiClient {
  getNews(params?: PaginationParams): Promise<PaginatedResult<NewsItem>>
  getNewsBySlug(slug: string): Promise<NewsItem | null>
  createNews(payload: Omit<NewsItem, 'slug'>, token: string): Promise<NewsItem>
  updateNews(slug: string, payload: Partial<NewsItem>, token: string): Promise<NewsItem>
  deleteNews(slug: string, token: string): Promise<void>

  getEvents(params?: EventListParams): Promise<PaginatedResult<Event>>
  getEventBySlug(slug: string): Promise<Event | null>
  createEvent(payload: Omit<Event, 'slug'>, token: string): Promise<Event>
  updateEvent(slug: string, payload: Partial<Event>, token: string): Promise<Event>
  deleteEvent(slug: string, token: string): Promise<void>

  getArticles(params?: ArticleListParams): Promise<PaginatedResult<ScientificArticle>>
  getArticleBySlug(slug: string): Promise<ScientificArticle | null>
  createArticle(payload: Omit<ScientificArticle, 'slug'>, token: string): Promise<ScientificArticle>
  updateArticle(
    slug: string,
    payload: Partial<ScientificArticle>,
    token: string,
  ): Promise<ScientificArticle>
  deleteArticle(slug: string, token: string): Promise<void>

  getProjects(params?: ProjectListParams): Promise<PaginatedResult<ResearchProject>>
  createProject(payload: Omit<ResearchProject, 'id'>, token: string): Promise<ResearchProject>
  updateProject(id: string, payload: Partial<ResearchProject>, token: string): Promise<ResearchProject>
  deleteProject(id: string, token: string): Promise<void>

  getSymposiumEditions(params?: SymposiumEditionListParams): Promise<PaginatedResult<SymposiumEdition>>
  getSymposiumEditionBySlug(slug: string): Promise<SymposiumEdition | null>
  createSymposiumEdition(
    payload: Omit<SymposiumEdition, 'slug'>,
    token: string,
  ): Promise<SymposiumEdition>
  updateSymposiumEdition(
    slug: string,
    payload: Partial<SymposiumEdition>,
    token: string,
  ): Promise<SymposiumEdition>
  deleteSymposiumEdition(slug: string, token: string): Promise<void>

  getTeam(params?: TeamListParams): Promise<TeamMember[]>

  getPartners(params?: PartnerListParams): Promise<Partner[]>
  createPartner(payload: Omit<Partner, 'id'>, token: string): Promise<Partner>
  updatePartner(id: string, payload: Partial<Partner>, token: string): Promise<Partner>
  deletePartner(id: string, token: string): Promise<void>

  submitContactForm(payload: ContactFormPayload): Promise<{ status: 'received' }>

  login(credentials: StaffCredentials): Promise<AuthSession>
  logout(token: string): Promise<void>
  setPassword(token: string, password: string): Promise<AuthSession>
  requestPasswordReset(email: string, redirectTo: string): Promise<void>

  getStaffMembers(token: string): Promise<StaffMember[]>
  inviteCollaborator(payload: InvitePayload, token: string): Promise<void>
  updateStaffRole(id: string, role: StaffRole, token: string): Promise<StaffMember>
  revokeStaffAccess(id: string, token: string): Promise<void>
  updateOwnProfile(payload: UpdateProfilePayload, token: string): Promise<AuthSession>

  getAuditLog(params: AuditLogListParams | undefined, token: string): Promise<PaginatedResult<AuditLogEntry>>
}
