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
} from '../ApiClient'
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
  Testimonial,
  UpdateProfilePayload,
} from '../../types/entities'
import { ApiError } from './ApiError'

/**
 * Talks HTTP to the `liac-backend` repo's Supabase Edge Functions (contract:
 * specs/contracts/api-contract.md) — the full `ApiClient` contract, no local fixtures left. Never
 * imports the Supabase SDK; this is a plain `fetch()` client against our own documented contract
 * (Constitution Princípio I stays intact — the real backend lives in the separate repo, this only
 * calls its HTTP surface).
 */
export class RestApiClient implements ApiClient {
  constructor(private readonly baseUrl: string) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    })

    if (response.status === 204) return undefined as T

    const body = await response.json().catch(() => null)

    if (!response.ok) {
      const error = body?.error ?? { code: 'UNKNOWN_ERROR', message: 'Erro inesperado' }
      throw new ApiError(error.code, error.message, response.status)
    }

    return body as T
  }

  private authHeader(token: string): Record<string, string> {
    return { Authorization: `Bearer ${token}` }
  }

  private query(params?: Record<string, string | number | undefined>): string {
    if (!params) return ''
    const entries = Object.entries(params).filter(([, value]) => value !== undefined)
    if (entries.length === 0) return ''
    const search = new URLSearchParams(entries.map(([key, value]) => [key, String(value)]))
    return `?${search.toString()}`
  }

  private async getBySlugOrNull<T>(path: string): Promise<T | null> {
    try {
      return await this.request<T>(path)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null
      throw err
    }
  }

  // Auth

  // Deployed as separate Edge Functions `auth-login`/`auth-logout` (each function is its own
  // top-level path segment under Supabase's routing model), not the nested `/auth/login` shape
  // from specs/contracts/api-contract.md — see liac-backend/README.md.
  async login(credentials: StaffCredentials): Promise<AuthSession> {
    return this.request<AuthSession>('/auth-login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async logout(token: string): Promise<void> {
    await this.request<void>('/auth-logout', {
      method: 'POST',
      headers: this.authHeader(token),
    })
  }

  async setPassword(token: string, password: string): Promise<AuthSession> {
    return this.request<AuthSession>('/set-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    })
  }

  async requestPasswordReset(email: string, redirectTo: string): Promise<void> {
    await this.request<void>('/auth-forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, redirectTo }),
    })
  }

  // Staff (team management + audit log — diretor_marketing/presidente/vice_presidente only)

  async getStaffMembers(token: string): Promise<StaffMember[]> {
    const { items } = await this.request<{ items: StaffMember[] }>('/staff', { headers: this.authHeader(token) })
    return items
  }

  async inviteCollaborator(payload: InvitePayload, token: string): Promise<void> {
    await this.request('/invite-collaborator', {
      method: 'POST',
      headers: this.authHeader(token),
      body: JSON.stringify(payload),
    })
  }

  async updateStaffRole(id: string, role: StaffRole, token: string): Promise<StaffMember> {
    return this.request(`/staff/${id}`, {
      method: 'PUT',
      headers: this.authHeader(token),
      body: JSON.stringify({ role }),
    })
  }

  async revokeStaffAccess(id: string, token: string): Promise<void> {
    await this.request(`/staff/${id}`, { method: 'DELETE', headers: this.authHeader(token) })
  }

  async updateOwnProfile(payload: UpdateProfilePayload, token: string): Promise<AuthSession> {
    return this.request('/staff/me', {
      method: 'PUT',
      headers: this.authHeader(token),
      body: JSON.stringify(payload),
    })
  }

  async getAuditLog(
    params: AuditLogListParams | undefined,
    token: string,
  ): Promise<PaginatedResult<AuditLogEntry>> {
    return this.request(
      `/audit-log${this.query({ page: params?.page, pageSize: params?.pageSize, author: params?.author })}`,
      { headers: this.authHeader(token) },
    )
  }

  // Team (public roster — reads staff_profiles, see liac-backend/supabase/functions/team)

  async getTeam(params?: TeamListParams): Promise<TeamMember[]> {
    const { items } = await this.request<{ items: TeamMember[] }>(`/team${this.query({ area: params?.area })}`)
    return items
  }

  // Partners

  async getPartners(params?: PartnerListParams): Promise<Partner[]> {
    const { items } = await this.request<{ items: Partner[] }>(`/partners${this.query({ tier: params?.tier })}`)
    return items
  }

  async createPartner(payload: Omit<Partner, 'id'>, token: string): Promise<Partner> {
    return this.request('/partners', {
      method: 'POST',
      headers: this.authHeader(token),
      body: JSON.stringify(payload),
    })
  }

  async updatePartner(id: string, payload: Partial<Partner>, token: string): Promise<Partner> {
    return this.request(`/partners/${id}`, {
      method: 'PUT',
      headers: this.authHeader(token),
      body: JSON.stringify(payload),
    })
  }

  async deletePartner(id: string, token: string): Promise<void> {
    await this.request(`/partners/${id}`, { method: 'DELETE', headers: this.authHeader(token) })
  }

  // News

  async getNews(params?: PaginationParams): Promise<PaginatedResult<NewsItem>> {
    return this.request(`/news${this.query({ page: params?.page, pageSize: params?.pageSize })}`)
  }

  async getNewsBySlug(slug: string): Promise<NewsItem | null> {
    return this.getBySlugOrNull(`/news/${slug}`)
  }

  async createNews(payload: Omit<NewsItem, 'slug'>, token: string): Promise<NewsItem> {
    return this.request('/news', { method: 'POST', headers: this.authHeader(token), body: JSON.stringify(payload) })
  }

  async updateNews(slug: string, payload: Partial<NewsItem>, token: string): Promise<NewsItem> {
    return this.request(`/news/${slug}`, {
      method: 'PUT',
      headers: this.authHeader(token),
      body: JSON.stringify(payload),
    })
  }

  async deleteNews(slug: string, token: string): Promise<void> {
    await this.request(`/news/${slug}`, { method: 'DELETE', headers: this.authHeader(token) })
  }

  // Events

  async getEvents(params?: EventListParams): Promise<PaginatedResult<Event>> {
    return this.request(
      `/events${this.query({ page: params?.page, pageSize: params?.pageSize, when: params?.when })}`,
    )
  }

  async getEventBySlug(slug: string): Promise<Event | null> {
    return this.getBySlugOrNull(`/events/${slug}`)
  }

  async createEvent(payload: Omit<Event, 'slug'>, token: string): Promise<Event> {
    return this.request('/events', { method: 'POST', headers: this.authHeader(token), body: JSON.stringify(payload) })
  }

  async updateEvent(slug: string, payload: Partial<Event>, token: string): Promise<Event> {
    return this.request(`/events/${slug}`, {
      method: 'PUT',
      headers: this.authHeader(token),
      body: JSON.stringify(payload),
    })
  }

  async deleteEvent(slug: string, token: string): Promise<void> {
    await this.request(`/events/${slug}`, { method: 'DELETE', headers: this.authHeader(token) })
  }

  // Articles

  async getArticles(params?: ArticleListParams): Promise<PaginatedResult<ScientificArticle>> {
    return this.request(
      `/articles${this.query({
        page: params?.page,
        pageSize: params?.pageSize,
        tag: params?.tag,
        author: params?.author,
      })}`,
    )
  }

  async getArticleBySlug(slug: string): Promise<ScientificArticle | null> {
    return this.getBySlugOrNull(`/articles/${slug}`)
  }

  async createArticle(payload: Omit<ScientificArticle, 'slug'>, token: string): Promise<ScientificArticle> {
    return this.request('/articles', {
      method: 'POST',
      headers: this.authHeader(token),
      body: JSON.stringify(payload),
    })
  }

  async updateArticle(
    slug: string,
    payload: Partial<ScientificArticle>,
    token: string,
  ): Promise<ScientificArticle> {
    return this.request(`/articles/${slug}`, {
      method: 'PUT',
      headers: this.authHeader(token),
      body: JSON.stringify(payload),
    })
  }

  async deleteArticle(slug: string, token: string): Promise<void> {
    await this.request(`/articles/${slug}`, { method: 'DELETE', headers: this.authHeader(token) })
  }

  // Projects

  async getProjects(params?: ProjectListParams): Promise<PaginatedResult<ResearchProject>> {
    return this.request(
      `/projects${this.query({ page: params?.page, pageSize: params?.pageSize, status: params?.status })}`,
    )
  }

  async createProject(payload: Omit<ResearchProject, 'id'>, token: string): Promise<ResearchProject> {
    return this.request('/projects', {
      method: 'POST',
      headers: this.authHeader(token),
      body: JSON.stringify(payload),
    })
  }

  async updateProject(id: string, payload: Partial<ResearchProject>, token: string): Promise<ResearchProject> {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      headers: this.authHeader(token),
      body: JSON.stringify(payload),
    })
  }

  async deleteProject(id: string, token: string): Promise<void> {
    await this.request(`/projects/${id}`, { method: 'DELETE', headers: this.authHeader(token) })
  }

  // Symposium Editions

  async getSymposiumEditions(
    params?: SymposiumEditionListParams,
  ): Promise<PaginatedResult<SymposiumEdition>> {
    return this.request(
      `/symposium-editions${this.query({ page: params?.page, pageSize: params?.pageSize })}`,
    )
  }

  async getSymposiumEditionBySlug(slug: string): Promise<SymposiumEdition | null> {
    return this.getBySlugOrNull(`/symposium-editions/${slug}`)
  }

  async createSymposiumEdition(
    payload: Omit<SymposiumEdition, 'slug'>,
    token: string,
  ): Promise<SymposiumEdition> {
    return this.request('/symposium-editions', {
      method: 'POST',
      headers: this.authHeader(token),
      body: JSON.stringify(payload),
    })
  }

  async updateSymposiumEdition(
    slug: string,
    payload: Partial<SymposiumEdition>,
    token: string,
  ): Promise<SymposiumEdition> {
    return this.request(`/symposium-editions/${slug}`, {
      method: 'PUT',
      headers: this.authHeader(token),
      body: JSON.stringify(payload),
    })
  }

  async deleteSymposiumEdition(slug: string, token: string): Promise<void> {
    await this.request(`/symposium-editions/${slug}`, { method: 'DELETE', headers: this.authHeader(token) })
  }

  // Testimonials

  async getTestimonials(): Promise<Testimonial[]> {
    return this.request('/testimonials')
  }

  async createTestimonial(payload: Omit<Testimonial, 'id'>, token: string): Promise<Testimonial> {
    return this.request('/testimonials', {
      method: 'POST',
      headers: this.authHeader(token),
      body: JSON.stringify(payload),
    })
  }

  async updateTestimonial(id: string, payload: Partial<Testimonial>, token: string): Promise<Testimonial> {
    return this.request(`/testimonials/${id}`, {
      method: 'PUT',
      headers: this.authHeader(token),
      body: JSON.stringify(payload),
    })
  }

  async deleteTestimonial(id: string, token: string): Promise<void> {
    await this.request(`/testimonials/${id}`, { method: 'DELETE', headers: this.authHeader(token) })
  }

  // Contact

  async submitContactForm(payload: ContactFormPayload): Promise<{ status: 'received' }> {
    return this.request('/contact', { method: 'POST', body: JSON.stringify(payload) })
  }
}
