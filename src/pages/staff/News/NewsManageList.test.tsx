import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NewsManageList } from './NewsManageList'
import { AuthProvider } from '../../../auth/AuthContext'
import { apiClient } from '../../../services/client'
import type { NewsItem } from '../../../types/entities'

vi.mock('../../../services/client', () => ({
  apiClient: {
    getNews: vi.fn(),
    deleteNews: vi.fn(),
  },
}))

const getNews = vi.mocked(apiClient.getNews)
const deleteNews = vi.mocked(apiClient.deleteNews)

const STORAGE_KEY = 'liac_staff_session'

function makeNews(overrides: Partial<NewsItem> = {}): NewsItem {
  return {
    slug: 'novidade-1',
    title: 'Novidade 1',
    publishedAt: '2026-08-01',
    category: 'Institucional',
    summary: 'Resumo',
    content: 'Conteúdo',
    featured: false,
    ...overrides,
  }
}

function renderPage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: 'tok-1', role: 'coordenador', displayName: 'Fulana' }))
  return render(
    <MemoryRouter>
      <AuthProvider>
        <NewsManageList />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('NewsManageList', () => {
  beforeEach(() => {
    getNews.mockReset()
    deleteNews.mockReset()
    localStorage.clear()
  })

  it('lists the fetched news items', async () => {
    getNews.mockResolvedValue({ items: [makeNews({ title: 'LIAC completa 8 anos' })], page: 1, pageSize: 100, total: 1 })
    renderPage()

    await waitFor(() => expect(screen.getByText('LIAC completa 8 anos')).toBeInTheDocument())
  })

  it('opens a confirmation dialog before deleting, and only deletes on confirm', async () => {
    getNews.mockResolvedValue({ items: [makeNews({ title: 'Para excluir' })], page: 1, pageSize: 100, total: 1 })
    deleteNews.mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => expect(screen.getByText('Para excluir')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Excluir' }))

    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toBeInTheDocument()
    expect(deleteNews).not.toHaveBeenCalled()

    await user.click(within(dialog).getByRole('button', { name: 'Excluir' }))

    await waitFor(() => expect(deleteNews).toHaveBeenCalledWith('novidade-1', 'tok-1'))
  })
})
