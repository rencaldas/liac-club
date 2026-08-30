import type {
  ApiClient,
  ArticleListParams,
  AuditLogListParams,
  EventListParams,
  PaginatedResult,
  PaginationParams,
  PartnerListParams,
  ProjectListParams,
  TeamListParams,
} from './ApiClient'
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
  TeamMember,
} from '../types/entities'
import { MockApiClient } from './mock/MockApiClient'
import { RestApiClient } from './rest/RestApiClient'

/**
 * Composes the two partial clients into the full `ApiClient` contract: News/Events/Articles and
 * staff auth go to the real backend (`RestApiClient`); Projects/Team/Partners/contact form stay
 * on local fixtures (`MockApiClient`) until a future feature gives them CRUD too.
 */
export class HybridApiClient implements ApiClient {
  private readonly mock = new MockApiClient()
  private readonly rest: RestApiClient

  constructor(apiBaseUrl: string) {
    this.rest = new RestApiClient(apiBaseUrl)
  }

  getNews(params?: PaginationParams): Promise<PaginatedResult<NewsItem>> {
    return this.rest.getNews(params)
  }
  getNewsBySlug(slug: string): Promise<NewsItem | null> {
    return this.rest.getNewsBySlug(slug)
  }
  createNews(payload: Omit<NewsItem, 'slug'>, token: string): Promise<NewsItem> {
    return this.rest.createNews(payload, token)
  }
  updateNews(slug: string, payload: Partial<NewsItem>, token: string): Promise<NewsItem> {
    return this.rest.updateNews(slug, payload, token)
  }
  deleteNews(slug: string, token: string): Promise<void> {
    return this.rest.deleteNews(slug, token)
  }

  getEvents(params?: EventListParams): Promise<PaginatedResult<Event>> {
    return this.rest.getEvents(params)
  }
  getEventBySlug(slug: string): Promise<Event | null> {
    return this.rest.getEventBySlug(slug)
  }
  createEvent(payload: Omit<Event, 'slug'>, token: string): Promise<Event> {
    return this.rest.createEvent(payload, token)
  }
  updateEvent(slug: string, payload: Partial<Event>, token: string): Promise<Event> {
    return this.rest.updateEvent(slug, payload, token)
  }
  deleteEvent(slug: string, token: string): Promise<void> {
    return this.rest.deleteEvent(slug, token)
  }

  getArticles(params?: ArticleListParams): Promise<PaginatedResult<ScientificArticle>> {
    return this.rest.getArticles(params)
  }
  getArticleBySlug(slug: string): Promise<ScientificArticle | null> {
    return this.rest.getArticleBySlug(slug)
  }
  createArticle(payload: Omit<ScientificArticle, 'slug'>, token: string): Promise<ScientificArticle> {
    return this.rest.createArticle(payload, token)
  }
  updateArticle(slug: string, payload: Partial<ScientificArticle>, token: string): Promise<ScientificArticle> {
    return this.rest.updateArticle(slug, payload, token)
  }
  deleteArticle(slug: string, token: string): Promise<void> {
    return this.rest.deleteArticle(slug, token)
  }

  getProjects(params?: ProjectListParams): Promise<PaginatedResult<ResearchProject>> {
    return this.mock.getProjects(params)
  }
  getTeam(params?: TeamListParams): Promise<TeamMember[]> {
    return this.mock.getTeam(params)
  }
  getPartners(params?: PartnerListParams): Promise<Partner[]> {
    return this.mock.getPartners(params)
  }
  submitContactForm(payload: ContactFormPayload): Promise<{ status: 'received' }> {
    return this.mock.submitContactForm(payload)
  }

  login(credentials: StaffCredentials): Promise<AuthSession> {
    return this.rest.login(credentials)
  }
  logout(token: string): Promise<void> {
    return this.rest.logout(token)
  }
  setPassword(token: string, password: string): Promise<AuthSession> {
    return this.rest.setPassword(token, password)
  }

  getStaffMembers(token: string): Promise<StaffMember[]> {
    return this.rest.getStaffMembers(token)
  }
  inviteCollaborator(payload: InvitePayload, token: string): Promise<void> {
    return this.rest.inviteCollaborator(payload, token)
  }
  updateStaffRole(id: string, role: StaffRole, token: string): Promise<StaffMember> {
    return this.rest.updateStaffRole(id, role, token)
  }
  revokeStaffAccess(id: string, token: string): Promise<void> {
    return this.rest.revokeStaffAccess(id, token)
  }

  getAuditLog(params: AuditLogListParams | undefined, token: string): Promise<PaginatedResult<AuditLogEntry>> {
    return this.rest.getAuditLog(params, token)
  }
}
