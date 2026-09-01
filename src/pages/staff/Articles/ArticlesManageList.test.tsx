import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ArticlesManageList } from './ArticlesManageList'
import { AuthProvider } from '../../../auth/AuthContext'
import { apiClient } from '../../../services/client'
import type { ScientificArticle } from '../../../types/entities'

vi.mock('../../../services/client', () => ({
  apiClient: {
    getArticles: vi.fn(),
    deleteArticle: vi.fn(),
  },
}))

const getArticles = vi.mocked(apiClient.getArticles)
const deleteArticle = vi.mocked(apiClient.deleteArticle)

const STORAGE_KEY = 'liac_staff_session'

function makeArticle(overrides: Partial<ScientificArticle> = {}): ScientificArticle {
  return {
    slug: 'artigo-1',
    title: 'Artigo 1',
    publishedAt: '2026-08-01',
    authors: ['Autora'],
    abstract: 'Resumo',
    tags: [],
    externalUrl: 'https://example.com',
    featured: false,
    ...overrides,
  }
}

function renderPage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: 'tok-1', role: 'coordenador', displayName: 'Fulana' }))
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ArticlesManageList />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('ArticlesManageList', () => {
  beforeEach(() => {
    getArticles.mockReset()
    deleteArticle.mockReset()
    localStorage.clear()
  })

  it('lists the fetched articles', async () => {
    getArticles.mockResolvedValue({ items: [makeArticle({ title: 'Colágeno na cosmetologia' })], page: 1, pageSize: 100, total: 1 })
    renderPage()

    await waitFor(() => expect(screen.getByText('Colágeno na cosmetologia')).toBeInTheDocument())
  })

  it('opens a confirmation dialog before deleting, and only deletes on confirm', async () => {
    getArticles.mockResolvedValue({ items: [makeArticle({ title: 'Para excluir' })], page: 1, pageSize: 100, total: 1 })
    deleteArticle.mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => expect(screen.getByText('Para excluir')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Excluir' }))

    const dialog = screen.getByRole('alertdialog')
    expect(deleteArticle).not.toHaveBeenCalled()

    await user.click(within(dialog).getByRole('button', { name: 'Excluir' }))

    await waitFor(() => expect(deleteArticle).toHaveBeenCalledWith('artigo-1', 'tok-1'))
  })
})
