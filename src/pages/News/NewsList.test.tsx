import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NewsList } from './NewsList'
import { apiClient } from '../../services/client'
import type { NewsItem } from '../../types/entities'

vi.mock('../../services/client', () => ({
  apiClient: {
    getNews: vi.fn(),
  },
}))

const getNews = vi.mocked(apiClient.getNews)

function makeItem(overrides: Partial<NewsItem>): NewsItem {
  return {
    slug: 'item',
    title: 'Título',
    publishedAt: '2026-08-01',
    category: 'Categoria',
    summary: 'Resumo',
    content: 'Conteúdo',
    ...overrides,
  }
}

function renderPage() {
  return render(
    <MemoryRouter>
      <NewsList />
    </MemoryRouter>,
  )
}

describe('NewsList', () => {
  beforeEach(() => {
    getNews.mockReset()
  })

  it('shows a loading state while fetching', () => {
    getNews.mockReturnValue(new Promise(() => {}))
    renderPage()

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders a card for each news item once loaded', async () => {
    getNews.mockResolvedValue({
      items: [
        makeItem({ slug: 'a', title: 'Primeira novidade' }),
        makeItem({ slug: 'b', title: 'Segunda novidade' }),
      ],
      page: 1,
      pageSize: 12,
      total: 2,
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Primeira novidade')).toBeInTheDocument()
    })
    expect(screen.getByText('Segunda novidade')).toBeInTheDocument()
  })

  it('shows an empty state when there are no news items', async () => {
    getNews.mockResolvedValue({ items: [], page: 1, pageSize: 12, total: 0 })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/ainda não há novidades publicadas/i)).toBeInTheDocument()
    })
  })
})
