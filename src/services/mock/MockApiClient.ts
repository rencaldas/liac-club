import type {
  PaginatedResult,
  PartnerListParams,
  ProjectListParams,
  SymposiumEditionListParams,
  TeamListParams,
} from '../ApiClient'
import type {
  ContactFormPayload,
  Partner,
  ResearchProject,
  SymposiumEdition,
  TeamMember,
} from '../../types/entities'
import projectsFixture from '../../mocks/projects.json'
import teamFixture from '../../mocks/team.json'
import partnersFixture from '../../mocks/partners.json'
import symposiumEditionsFixture from '../../mocks/symposium-editions.json'
import { delay } from './delay'
import { paginate } from './paginate'
import { slugify } from './slugify'

const team = teamFixture as TeamMember[]
const partners = partnersFixture as Partner[]

/**
 * Reads from the local fixtures imported above. No real network call is made anywhere in this
 * class. Covers the entities that stay mock-only in the staff-area MVP (Projects, Symposium
 * Editions, Team, Partners, contact form); News/Events/Articles/auth are served by
 * `RestApiClient` instead — see `HybridApiClient`, which composes both into the full `ApiClient`
 * interface. Projects, Symposium Editions and Partners support create/update/delete here
 * (mutating the in-memory copy) so their staff-area CRUD screens have something to talk to ahead
 * of a real backend for them.
 */
export class MockApiClient {
  private projects: ResearchProject[] = [...(projectsFixture as ResearchProject[])]
  private symposiumEditions: SymposiumEdition[] = [...(symposiumEditionsFixture as SymposiumEdition[])]
  private partners: Partner[] = [...partners]

  async getProjects(params?: ProjectListParams): Promise<PaginatedResult<ResearchProject>> {
    await delay()
    let filtered = [...this.projects]
    if (params?.status) {
      filtered = filtered.filter((project) => project.status === params.status)
    }
    return paginate(filtered, params)
  }

  async createProject(payload: Omit<ResearchProject, 'id'>): Promise<ResearchProject> {
    await delay()
    const id = `proj-${slugify(payload.title, this.projects.map((project) => project.id.replace(/^proj-/, '')))}`
    const project: ResearchProject = { ...payload, id }
    this.projects = [project, ...this.projects]
    return project
  }

  async updateProject(id: string, payload: Partial<ResearchProject>): Promise<ResearchProject> {
    await delay()
    const index = this.projects.findIndex((project) => project.id === id)
    if (index === -1) throw new Error(`Project not found: ${id}`)
    const updated = { ...this.projects[index], ...payload, id }
    this.projects = [...this.projects.slice(0, index), updated, ...this.projects.slice(index + 1)]
    return updated
  }

  async deleteProject(id: string): Promise<void> {
    await delay()
    this.projects = this.projects.filter((project) => project.id !== id)
  }

  async getSymposiumEditions(
    params?: SymposiumEditionListParams,
  ): Promise<PaginatedResult<SymposiumEdition>> {
    await delay()
    const sorted = [...this.symposiumEditions].sort((a, b) => b.year - a.year)
    return paginate(sorted, params)
  }

  async getSymposiumEditionBySlug(slug: string): Promise<SymposiumEdition | null> {
    await delay()
    return this.symposiumEditions.find((edition) => edition.slug === slug) ?? null
  }

  async createSymposiumEdition(payload: Omit<SymposiumEdition, 'slug'>): Promise<SymposiumEdition> {
    await delay()
    const slug = slugify(payload.title, this.symposiumEditions.map((edition) => edition.slug))
    const edition: SymposiumEdition = { ...payload, slug }
    this.symposiumEditions = [edition, ...this.symposiumEditions]
    return edition
  }

  async updateSymposiumEdition(
    slug: string,
    payload: Partial<SymposiumEdition>,
  ): Promise<SymposiumEdition> {
    await delay()
    const index = this.symposiumEditions.findIndex((edition) => edition.slug === slug)
    if (index === -1) throw new Error(`Symposium edition not found: ${slug}`)
    const updated = { ...this.symposiumEditions[index], ...payload, slug }
    this.symposiumEditions = [
      ...this.symposiumEditions.slice(0, index),
      updated,
      ...this.symposiumEditions.slice(index + 1),
    ]
    return updated
  }

  async deleteSymposiumEdition(slug: string): Promise<void> {
    await delay()
    this.symposiumEditions = this.symposiumEditions.filter((edition) => edition.slug !== slug)
  }

  async getTeam(params?: TeamListParams): Promise<TeamMember[]> {
    await delay()
    if (params?.area) {
      return team.filter((member) => member.area === params.area)
    }
    return [...team]
  }

  async getPartners(params?: PartnerListParams): Promise<Partner[]> {
    await delay()
    if (params?.tier) {
      return this.partners.filter((partner) => partner.tier === params.tier)
    }
    return [...this.partners]
  }

  async createPartner(payload: Omit<Partner, 'id'>): Promise<Partner> {
    await delay()
    const id = `partner-${slugify(payload.name, this.partners.map((partner) => partner.id.replace(/^partner-/, '')))}`
    const partner: Partner = { ...payload, id }
    this.partners = [partner, ...this.partners]
    return partner
  }

  async updatePartner(id: string, payload: Partial<Partner>): Promise<Partner> {
    await delay()
    const index = this.partners.findIndex((partner) => partner.id === id)
    if (index === -1) throw new Error(`Partner not found: ${id}`)
    const updated = { ...this.partners[index], ...payload, id }
    this.partners = [...this.partners.slice(0, index), updated, ...this.partners.slice(index + 1)]
    return updated
  }

  async deletePartner(id: string): Promise<void> {
    await delay()
    this.partners = this.partners.filter((partner) => partner.id !== id)
  }

  async submitContactForm(_payload: ContactFormPayload): Promise<{ status: 'received' }> {
    await delay()
    return { status: 'received' }
  }
}
