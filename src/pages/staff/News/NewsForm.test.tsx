import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider, useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NewsForm } from './NewsForm'
import { AuthProvider } from '../../../auth/AuthContext'
import { apiClient } from '../../../services/client'

vi.mock('../../../services/client', () => ({
  apiClient: {
    getNewsBySlug: vi.fn(),
    createNews: vi.fn(),
    updateNews: vi.fn(),
  },
}))

// React Router v7's real navigate() constructs an internal Request/AbortSignal that collides
// with jsdom's AbortSignal implementation in this test environment (unrelated to our code —
// only reproduces when a navigation actually runs inside a data router). useNavigate is mocked
// so these tests verify NewsForm calls navigate() correctly without exercising the router's own
// navigation engine; useBlocker (also from react-router-dom) stays real, which is why a data
// router (createMemoryRouter/RouterProvider) is still required just to mount the component.
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: vi.fn() }
})

const createNews = vi.mocked(apiClient.createNews)
const navigateMock = vi.fn()
vi.mocked(useNavigate).mockReturnValue(navigateMock)

const STORAGE_KEY = 'liac_staff_session'

function renderPage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: 'tok-1', role: 'coordenador', displayName: 'Fulana' }))
  const router = createMemoryRouter([{ path: '/portal-liac/novidades/novo', element: <NewsForm /> }], {
    initialEntries: ['/portal-liac/novidades/novo'],
  })
  return render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  )
}

describe('NewsForm (create)', () => {
  beforeEach(() => {
    createNews.mockReset()
    navigateMock.mockReset()
    localStorage.clear()
  })

  it('blocks submit and shows field errors when required fields are empty', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Informe um título.')).toBeInTheDocument()
    expect(createNews).not.toHaveBeenCalled()
  })

  it('creates the news item with the featured toggle and navigates back to the list', async () => {
    createNews.mockResolvedValue({
      slug: 'nova-novidade',
      title: 'Nova novidade',
      publishedAt: '2026-08-30',
      category: 'Institucional',
      summary: 'Resumo curto',
      content: 'Conteúdo completo',
      featured: true,
    })
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Título'), 'Nova novidade')
    await user.type(screen.getByLabelText('Data de publicação'), '2026-08-30')
    await user.type(screen.getByLabelText('Categoria'), 'Institucional')
    await user.type(screen.getByLabelText('Resumo'), 'Resumo curto')
    await user.type(screen.getByLabelText('Conteúdo'), 'Conteúdo completo')
    await user.click(screen.getByLabelText('Destacar no carrossel da Home'))
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(createNews).toHaveBeenCalledWith(
        {
          title: 'Nova novidade',
          publishedAt: '2026-08-30',
          category: 'Institucional',
          summary: 'Resumo curto',
          content: 'Conteúdo completo',
          coverImageUrl: undefined,
          featured: true,
        },
        'tok-1',
      )
    })
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/portal-liac/novidades'))
  })
})
