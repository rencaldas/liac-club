import type {
  ApiClient,
  ArticleListParams,
  AuditLogListParams,
  EventListParams,
  PaginatedResult,
  PaginationParams,
  PartnerListParams,
  ProjectListParams,
  SymposiumEditionListParams,
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
  SymposiumEdition,
  TeamMember,
  UpdateProfilePayload,
} from '../types/entities'
import { MockApiClient } from './mock/MockApiClient'
import { RestApiClient } from './rest/RestApiClient'

/**
 * Composes the two partial clients into the full `ApiClient` contract: News/Events/Articles,
 * staff auth and Team go to the real backend (`RestApiClient`); Projects/Partners/contact form
 * stay on local fixtures (`MockApiClient`) until a future feature gives them CRUD too.
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
  createProject(payload: Omit<ResearchProject, 'id'>, _token: string): Promise<ResearchProject> {
    return this.mock.createProject(payload)
  }
  updateProject(id: string, payload: Partial<ResearchProject>, _token: string): Promise<ResearchProject> {
    return this.mock.updateProject(id, payload)
  }
  deleteProject(id: string, _token: string): Promise<void> {
    return this.mock.deleteProject(id)
  }

  getSymposiumEditions(
    params?: SymposiumEditionListParams,
  ): Promise<PaginatedResult<SymposiumEdition>> {
    return this.mock.getSymposiumEditions(params)
  }
  getSymposiumEditionBySlug(slug: string): Promise<SymposiumEdition | null> {
    return this.mock.getSymposiumEditionBySlug(slug)
  }
  createSymposiumEdition(
    payload: Omit<SymposiumEdition, 'slug'>,
    _token: string,
  ): Promise<SymposiumEdition> {
    return this.mock.createSymposiumEdition(payload)
  }
  updateSymposiumEdition(
    slug: string,
    payload: Partial<SymposiumEdition>,
    _token: string,
  ): Promise<SymposiumEdition> {
    return this.mock.updateSymposiumEdition(slug, payload)
  }
  deleteSymposiumEdition(slug: string, _token: string): Promise<void> {
    return this.mock.deleteSymposiumEdition(slug)
  }

  getTeam(params?: TeamListParams): Promise<TeamMember[]> {
    return this.rest.getTeam(params)
  }
  getPartners(params?: PartnerListParams): Promise<Partner[]> {
    return this.mock.getPartners(params)
  }
  createPartner(payload: Omit<Partner, 'id'>, _token: string): Promise<Partner> {
    return this.mock.createPartner(payload)
  }
  updatePartner(id: string, payload: Partial<Partner>, _token: string): Promise<Partner> {
    return this.mock.updatePartner(id, payload)
  }
  deletePartner(id: string, _token: string): Promise<void> {
    return this.mock.deletePartner(id)
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
  requestPasswordReset(email: string, redirectTo: string): Promise<void> {
    return this.rest.requestPasswordReset(email, redirectTo)
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
  updateOwnProfile(payload: UpdateProfilePayload, token: string): Promise<AuthSession> {
    return this.rest.updateOwnProfile(payload, token)
  }

  getAuditLog(params: AuditLogListParams | undefined, token: string): Promise<PaginatedResult<AuditLogEntry>> {
    return this.rest.getAuditLog(params, token)
  }
}
