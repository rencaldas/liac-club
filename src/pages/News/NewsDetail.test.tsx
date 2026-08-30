import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NewsDetail } from './NewsDetail'
import { apiClient } from '../../services/client'

vi.mock('../../services/client', () => ({
  apiClient: {
    getNewsBySlug: vi.fn(),
  },
}))

const getNewsBySlug = vi.mocked(apiClient.getNewsBySlug)

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/novidades/:slug" element={<NewsDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('NewsDetail', () => {
  beforeEach(() => {
    getNewsBySlug.mockReset()
  })

  it('renders the full content of an existing news item', async () => {
    getNewsBySlug.mockResolvedValue({
      slug: 'existente',
      title: 'Notícia existente',
      publishedAt: '2026-08-01',
      category: 'Categoria',
      summary: 'Resumo',
      content: 'Conteúdo completo da notícia.',
    })

    renderAt('/novidades/existente')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Notícia existente' })).toBeInTheDocument()
    })
    expect(screen.getByText('Conteúdo completo da notícia.')).toBeInTheDocument()
  })

  it('renders a not-found page for a slug that does not exist', async () => {
    getNewsBySlug.mockResolvedValue(null)

    renderAt('/novidades/nao-existe')

    await waitFor(() => {
      expect(screen.getByText('404')).toBeInTheDocument()
    })
  })
})
