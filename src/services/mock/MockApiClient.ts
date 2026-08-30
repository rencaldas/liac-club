import type {
  ApiClient,
  ArticleListParams,
  EventListParams,
  PaginatedResult,
  PaginationParams,
  PartnerListParams,
  ProjectListParams,
  TeamListParams,
} from '../ApiClient'
import type {
  ContactFormPayload,
  Event,
  NewsItem,
  Partner,
  ResearchProject,
  ScientificArticle,
  TeamMember,
} from '../../types/entities'
import newsFixture from '../../mocks/news.json'
import eventsFixture from '../../mocks/events.json'
import articlesFixture from '../../mocks/articles.json'
import projectsFixture from '../../mocks/projects.json'
import teamFixture from '../../mocks/team.json'
import partnersFixture from '../../mocks/partners.json'
import { delay } from './delay'
import { paginate } from './paginate'
import { findBySlug } from '../../utils/slug'

const news = newsFixture as NewsItem[]
const events = eventsFixture as Event[]
const articles = articlesFixture as ScientificArticle[]
const projects = projectsFixture as ResearchProject[]
const team = teamFixture as TeamMember[]
const partners = partnersFixture as Partner[]

function byMostRecent(a: { publishedAt: string }, b: { publishedAt: string }) {
  return b.publishedAt.localeCompare(a.publishedAt)
}

function byStartDateDesc(a: Event, b: Event) {
  return b.startDate.localeCompare(a.startDate)
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Reads from the local fixtures imported above. No real network call is made anywhere in this
 * class — it is the only implementation of ApiClient in this repository (Constitution Princípio
 * I). Reads only; write operations are introduced by feature 002.
 */
export class MockApiClient implements ApiClient {
  async getNews(params?: PaginationParams): Promise<PaginatedResult<NewsItem>> {
    await delay()
    return paginate([...news].sort(byMostRecent), params)
  }

  async getNewsBySlug(slug: string): Promise<NewsItem | null> {
    await delay()
    return findBySlug(news, slug)
  }

  async getEvents(params?: EventListParams): Promise<PaginatedResult<Event>> {
    await delay()
    const today = todayIso()
    let filtered = [...events]
    if (params?.when === 'upcoming') {
      filtered = filtered.filter((event) => event.endDate >= today)
    } else if (params?.when === 'past') {
      filtered = filtered.filter((event) => event.endDate < today)
    }
    return paginate(filtered.sort(byStartDateDesc), params)
  }

  async getEventBySlug(slug: string): Promise<Event | null> {
    await delay()
    return findBySlug(events, slug)
  }

  async getArticles(params?: ArticleListParams): Promise<PaginatedResult<ScientificArticle>> {
    await delay()
    let filtered = [...articles]
    if (params?.tag) {
      filtered = filtered.filter((article) => article.tags.includes(params.tag as string))
    }
    if (params?.author) {
      filtered = filtered.filter((article) =>
        article.authors.some((author) =>
          author.toLowerCase().includes((params.author as string).toLowerCase()),
        ),
      )
    }
    return paginate(filtered, params)
  }

  async getArticleBySlug(slug: string): Promise<ScientificArticle | null> {
    await delay()
    return findBySlug(articles, slug)
  }

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
