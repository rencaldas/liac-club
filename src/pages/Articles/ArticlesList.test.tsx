import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ArticlesList } from './ArticlesList'
import { apiClient } from '../../services/client'
import type { ScientificArticle } from '../../types/entities'

vi.mock('../../services/client', () => ({
  apiClient: {
    getArticles: vi.fn(),
  },
}))

const getArticles = vi.mocked(apiClient.getArticles)

function makeArticle(overrides: Partial<ScientificArticle>): ScientificArticle {
  return {
    slug: 'artigo',
    title: 'Artigo',
    publishedAt: '2026-08-01',
    authors: ['Autora'],
    abstract: 'Resumo',
    tags: ['tag'],
    externalUrl: 'https://example.com',
    ...overrides,
  }
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ArticlesList />
    </MemoryRouter>,
  )
}

describe('ArticlesList', () => {
  beforeEach(() => {
    getArticles.mockReset()
    getArticles.mockResolvedValue({ items: [], page: 1, pageSize: 12, total: 0 })
  })

  it('fetches without filters on first render', async () => {
    renderPage()

    await waitFor(() => {
      expect(getArticles).toHaveBeenCalledWith({ tag: undefined, author: undefined })
    })
  })

  it('refetches with the tag and author typed once the filter form is submitted', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(getArticles).toHaveBeenCalled())

    await user.type(screen.getByLabelText('Tema'), 'colágeno')
    await user.type(screen.getByLabelText('Autor'), 'Ramos')
    await user.click(screen.getByRole('button', { name: 'Filtrar' }))

    await waitFor(() => {
      expect(getArticles).toHaveBeenLastCalledWith({ tag: 'colágeno', author: 'Ramos' })
    })
  })

  it('renders a card per article once loaded', async () => {
    getArticles.mockResolvedValue({
      items: [makeArticle({ slug: 'a', title: 'Artigo A' })],
      page: 1,
      pageSize: 12,
      total: 1,
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Artigo A')).toBeInTheDocument()
    })
  })
})
