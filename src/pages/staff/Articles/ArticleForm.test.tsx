import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider, useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ArticleForm } from './ArticleForm'
import { AuthProvider } from '../../../auth/AuthContext'
import { apiClient } from '../../../services/client'

vi.mock('../../../services/client', () => ({
  apiClient: {
    getArticleBySlug: vi.fn(),
    createArticle: vi.fn(),
    updateArticle: vi.fn(),
  },
}))

// See NewsForm.test.tsx for why useNavigate is mocked: React Router v7's real navigate() hits a
// jsdom/undici AbortSignal incompatibility in this test environment, unrelated to our code.
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: vi.fn() }
})

const createArticle = vi.mocked(apiClient.createArticle)
const navigateMock = vi.fn()
vi.mocked(useNavigate).mockReturnValue(navigateMock)

const STORAGE_KEY = 'liac_staff_session'

function renderPage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: 'tok-1', role: 'coordenador', displayName: 'Fulana' }))
  const router = createMemoryRouter([{ path: '/portal-liac/artigos/novo', element: <ArticleForm /> }], {
    initialEntries: ['/portal-liac/artigos/novo'],
  })
  return render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  )
}

describe('ArticleForm (create)', () => {
  beforeEach(() => {
    createArticle.mockReset()
    navigateMock.mockReset()
    localStorage.clear()
  })

  it('blocks submit and shows field errors when required fields are empty', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Informe um título.')).toBeInTheDocument()
    expect(createArticle).not.toHaveBeenCalled()
  })

  it('rejects a malformed external URL', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Título'), 'Artigo Teste')
    await user.type(screen.getByLabelText('Autores (separados por vírgula)'), 'Autora A')
    await user.type(screen.getByLabelText('Resumo'), 'Resumo do artigo')
    await user.type(screen.getByLabelText('Link externo (PDF/DOI)'), 'não-é-uma-url')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Informe uma URL válida (ex: https://...).')).toBeInTheDocument()
    expect(createArticle).not.toHaveBeenCalled()
  })

  it('splits comma-separated authors/tags into arrays and creates the article', async () => {
    createArticle.mockResolvedValue({
      slug: 'artigo-teste',
      title: 'Artigo Teste',
      publishedAt: '2026-08-20',
      authors: ['Autora A', 'Autora B'],
      abstract: 'Resumo do artigo',
      tags: ['formulação'],
      externalUrl: 'https://doi.org/x',
      featured: false,
    })
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Título'), 'Artigo Teste')
    await user.type(screen.getByLabelText('Data de publicação'), '2026-08-20')
    await user.type(screen.getByLabelText('Autores (separados por vírgula)'), 'Autora A, Autora B')
    await user.type(screen.getByLabelText('Resumo'), 'Resumo do artigo')
    await user.type(screen.getByLabelText('Tags (separadas por vírgula, opcional)'), 'formulação')
    await user.type(screen.getByLabelText('Link externo (PDF/DOI)'), 'https://doi.org/x')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(createArticle).toHaveBeenCalledWith(
        {
          title: 'Artigo Teste',
          publishedAt: '2026-08-20',
          authors: ['Autora A', 'Autora B'],
          abstract: 'Resumo do artigo',
          tags: ['formulação'],
          externalUrl: 'https://doi.org/x',
          featured: false,
        },
        'tok-1',
      )
    })
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/portal-liac/artigos'))
  })
})
