import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ArticleDetail } from './ArticleDetail'
import { apiClient } from '../../services/client'

vi.mock('../../services/client', () => ({
  apiClient: {
    getArticleBySlug: vi.fn(),
  },
}))

const getArticleBySlug = vi.mocked(apiClient.getArticleBySlug)

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/artigos/:slug" element={<ArticleDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ArticleDetail', () => {
  beforeEach(() => {
    getArticleBySlug.mockReset()
  })

  it('shows all authors and a link to the external PDF/DOI', async () => {
    getArticleBySlug.mockResolvedValue({
      slug: 'artigo-existente',
      title: 'Artigo existente',
      publishedAt: '2026-07-09',
      authors: ['Ana Beatriz Ramos', 'Carla Menezes'],
      abstract: 'Resumo completo.',
      tags: ['colágeno'],
      externalUrl: 'https://doi.org/10.1000/exemplo',
    })

    renderAt('/artigos/artigo-existente')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Artigo existente' })).toBeInTheDocument()
    })
    expect(screen.getByText('Publicado por:')).toBeInTheDocument()
    expect(screen.getByText('Ana Beatriz Ramos e Carla Menezes')).toBeInTheDocument()
    expect(screen.getByText('09/07/2026')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver artigo original/i })).toHaveAttribute(
      'href',
      'https://doi.org/10.1000/exemplo',
    )
  })

  it('renders a not-found page for a slug that does not exist', async () => {
    getArticleBySlug.mockResolvedValue(null)

    renderAt('/artigos/nao-existe')

    await waitFor(() => {
      expect(screen.getByText('404')).toBeInTheDocument()
    })
  })
})
