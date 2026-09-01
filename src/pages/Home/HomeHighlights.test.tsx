import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HomeHighlights } from './HomeHighlights'
import { apiClient } from '../../services/client'
import type {
  Event,
  NewsItem,
  ResearchProject,
  ScientificArticle,
  SymposiumEdition,
  Testimonial,
} from '../../types/entities'

vi.mock('../../services/client', () => ({
  apiClient: {
    getNews: vi.fn(),
    getEvents: vi.fn(),
    getArticles: vi.fn(),
    getSymposiumEditions: vi.fn(),
    getProjects: vi.fn(),
    getTestimonials: vi.fn(),
  },
}))

function makeNews(n: number): NewsItem[] {
  return Array.from({ length: n }, (_, i) => ({
    slug: `novidade-${i}`,
    title: `Novidade ${i}`,
    publishedAt: '2026-08-01',
    category: 'Categoria',
    summary: 'Resumo',
    content: 'Conteúdo',
  }))
}

function makeEvents(n: number): Event[] {
  return Array.from({ length: n }, (_, i) => ({
    slug: `evento-${i}`,
    title: `Evento ${i}`,
    startDate: '2026-09-01',
    endDate: '2026-09-01',
    location: 'Local',
    type: 'workshop',
    description: 'Descrição',
  }))
}

function makeArticles(n: number): ScientificArticle[] {
  return Array.from({ length: n }, (_, i) => ({
    slug: `artigo-${i}`,
    title: `Artigo ${i}`,
    publishedAt: '2026-08-01',
    authors: ['Autora'],
    abstract: 'Resumo',
    tags: [],
    externalUrl: 'https://example.com',
  }))
}

function makeEditions(n: number): SymposiumEdition[] {
  return Array.from({ length: n }, (_, i) => ({
    slug: `edicao-${i}`,
    title: `Edição ${i}`,
    year: 2020 + i,
    startDate: '2026-10-01',
    endDate: '2026-10-01',
    location: 'Local',
    description: 'Descrição',
  }))
}

function makeProjects(n: number): ResearchProject[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `projeto-${i}`,
    title: `Projeto ${i}`,
    status: 'ativo',
    summary: 'Resumo',
    members: ['Integrante'],
  }))
}

function makeTestimonials(n: number): Testimonial[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `depoimento-${i}`,
    name: `Ligante ${i}`,
    text: 'Depoimento',
  }))
}

function renderHighlights() {
  return render(
    <MemoryRouter>
      <HomeHighlights />
    </MemoryRouter>,
  )
}

describe('HomeHighlights', () => {
  beforeEach(() => {
    vi.mocked(apiClient.getNews).mockResolvedValue({
      items: makeNews(8),
      page: 1,
      pageSize: 8,
      total: 8,
    })
    vi.mocked(apiClient.getEvents).mockResolvedValue({
      items: makeEvents(8),
      page: 1,
      pageSize: 8,
      total: 8,
    })
    vi.mocked(apiClient.getArticles).mockResolvedValue({
      items: makeArticles(8),
      page: 1,
      pageSize: 8,
      total: 8,
    })
    vi.mocked(apiClient.getSymposiumEditions).mockResolvedValue({
      items: makeEditions(8),
      page: 1,
      pageSize: 8,
      total: 8,
    })
    vi.mocked(apiClient.getProjects).mockResolvedValue({
      items: makeProjects(8),
      page: 1,
      pageSize: 8,
      total: 8,
    })
    vi.mocked(apiClient.getTestimonials).mockResolvedValue(makeTestimonials(8))
  })

  it('requests exactly 8 items of each content type', async () => {
    renderHighlights()

    await waitFor(() => {
      expect(apiClient.getNews).toHaveBeenCalledWith({ pageSize: 8 })
    })
    expect(apiClient.getEvents).toHaveBeenCalledWith({ pageSize: 8 })
    expect(apiClient.getArticles).toHaveBeenCalledWith({ pageSize: 8 })
    expect(apiClient.getSymposiumEditions).toHaveBeenCalledWith({ pageSize: 8 })
    expect(apiClient.getProjects).toHaveBeenCalledWith({ pageSize: 8 })
    expect(apiClient.getTestimonials).toHaveBeenCalled()
  })

  it('renders a carousel of cards for each type, each linking to its own detail page', async () => {
    renderHighlights()

    await waitFor(() => {
      expect(screen.getByText('Novidade 0')).toBeInTheDocument()
    })
    expect(screen.getByRole('link', { name: 'Novidade 0' })).toHaveAttribute(
      'href',
      '/novidades/novidade-0',
    )
    expect(screen.getByRole('link', { name: 'Evento 0' })).toHaveAttribute(
      'href',
      '/eventos/evento-0',
    )
    expect(screen.getByRole('link', { name: 'Artigo 0' })).toHaveAttribute(
      'href',
      '/artigos/artigo-0',
    )
    expect(screen.getByRole('link', { name: 'Edição 0' })).toHaveAttribute(
      'href',
      '/edicoes-anteriores/edicao-0',
    )
    expect(screen.getByText('Projeto 0')).toBeInTheDocument()
    expect(screen.getByText('Ligante 0')).toBeInTheDocument()
  })

  it('renders the testimonials carousel as the last section on the page', async () => {
    renderHighlights()

    await waitFor(() => expect(screen.getByText('Ligante 0')).toBeInTheDocument())

    expect(screen.getByRole('heading', { name: 'Depoimentos de ligantes' })).toBeInTheDocument()
  })

  it('links each "Ver todas/todos" to the corresponding listing page', async () => {
    renderHighlights()

    await waitFor(() => expect(screen.getByText('Novidade 0')).toBeInTheDocument())

    const verTodas = screen.getAllByRole('link', { name: 'Ver todas' })
    expect(verTodas[0]).toHaveAttribute('href', '/novidades')
    expect(verTodas[1]).toHaveAttribute('href', '/edicoes-anteriores')
    const verTodos = screen.getAllByRole('link', { name: 'Ver todos' })
    expect(verTodos[0]).toHaveAttribute('href', '/eventos')
    expect(verTodos[1]).toHaveAttribute('href', '/artigos')
    expect(verTodos[2]).toHaveAttribute('href', '/projetos')
  })
})
