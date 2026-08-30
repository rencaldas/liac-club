import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HomeHighlights } from './HomeHighlights'
import { apiClient } from '../../services/client'
import type { Event, NewsItem, ScientificArticle } from '../../types/entities'

vi.mock('../../services/client', () => ({
  apiClient: {
    getNews: vi.fn(),
    getEvents: vi.fn(),
    getArticles: vi.fn(),
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
    authors: ['Autora'],
    abstract: 'Resumo',
    tags: [],
    externalUrl: 'https://example.com',
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
      items: makeNews(3),
      page: 1,
      pageSize: 3,
      total: 3,
    })
    vi.mocked(apiClient.getEvents).mockResolvedValue({
      items: makeEvents(3),
      page: 1,
      pageSize: 3,
      total: 3,
    })
    vi.mocked(apiClient.getArticles).mockResolvedValue({
      items: makeArticles(3),
      page: 1,
      pageSize: 3,
      total: 3,
    })
  })

  it('requests exactly 3 items of each content type', async () => {
    renderHighlights()

    await waitFor(() => {
      expect(apiClient.getNews).toHaveBeenCalledWith({ pageSize: 3 })
    })
    expect(apiClient.getEvents).toHaveBeenCalledWith({ pageSize: 3 })
    expect(apiClient.getArticles).toHaveBeenCalledWith({ pageSize: 3 })
  })

  it('renders 3 cards of each type, each linking to its own detail page', async () => {
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
  })

  it('links each "Ver todas/todos" to the corresponding listing page', async () => {
    renderHighlights()

    await waitFor(() => expect(screen.getByText('Novidade 0')).toBeInTheDocument())

    expect(screen.getByRole('link', { name: 'Ver todas' })).toHaveAttribute('href', '/novidades')
    const verTodos = screen.getAllByRole('link', { name: 'Ver todos' })
    expect(verTodos[0]).toHaveAttribute('href', '/eventos')
    expect(verTodos[1]).toHaveAttribute('href', '/artigos')
  })
})
