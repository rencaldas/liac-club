import type { PaginatedResult, PartnerListParams, ProjectListParams, TeamListParams } from '../ApiClient'
import type { ContactFormPayload, Partner, ResearchProject, TeamMember } from '../../types/entities'
import projectsFixture from '../../mocks/projects.json'
import teamFixture from '../../mocks/team.json'
import partnersFixture from '../../mocks/partners.json'
import { delay } from './delay'
import { paginate } from './paginate'

const projects = projectsFixture as ResearchProject[]
const team = teamFixture as TeamMember[]
const partners = partnersFixture as Partner[]

/**
 * Reads from the local fixtures imported above. No real network call is made anywhere in this
 * class. Covers the entities that stay mock-only in the staff-area MVP (Projects, Team,
 * Partners, contact form); News/Events/Articles/auth are served by `RestApiClient` instead —
 * see `HybridApiClient`, which composes both into the full `ApiClient` interface.
 */
export class MockApiClient {
  async getProjects(params?: ProjectListParams): Promise<PaginatedResult<ResearchProject>> {
    await delay()
    let filtered = [...projects]
    if (params?.status) {
      filtered = filtered.filter((project) => project.status === params.status)
    }
    return paginate(filtered, params)
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
      return partners.filter((partner) => partner.tier === params.tier)
    }
    return [...partners]
  }

  async submitContactForm(_payload: ContactFormPayload): Promise<{ status: 'received' }> {
    await delay()
    return { status: 'received' }
  }
}
