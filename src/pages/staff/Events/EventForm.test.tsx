import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider, useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EventForm } from './EventForm'
import { AuthProvider } from '../../../auth/AuthContext'
import { apiClient } from '../../../services/client'

vi.mock('../../../services/client', () => ({
  apiClient: {
    getEventBySlug: vi.fn(),
    createEvent: vi.fn(),
    updateEvent: vi.fn(),
  },
}))

// See NewsForm.test.tsx for why useNavigate is mocked: React Router v7's real navigate() hits a
// jsdom/undici AbortSignal incompatibility in this test environment, unrelated to our code.
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: vi.fn() }
})

const createEvent = vi.mocked(apiClient.createEvent)
const navigateMock = vi.fn()
vi.mocked(useNavigate).mockReturnValue(navigateMock)

const STORAGE_KEY = 'liac_staff_session'

function renderPage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: 'tok-1', role: 'coordenador', displayName: 'Fulana' }))
  const router = createMemoryRouter([{ path: '/portal-equipe/eventos/novo', element: <EventForm /> }], {
    initialEntries: ['/portal-equipe/eventos/novo'],
  })
  return render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  )
}

describe('EventForm (create)', () => {
  beforeEach(() => {
    createEvent.mockReset()
    navigateMock.mockReset()
    localStorage.clear()
  })

  it('blocks submit and shows field errors when required fields are empty', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Informe um título.')).toBeInTheDocument()
    expect(createEvent).not.toHaveBeenCalled()
  })

  it('rejects an end date earlier than the start date', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Título'), 'Evento Teste')
    await user.type(screen.getByLabelText('Data de início'), '2026-09-10')
    await user.type(screen.getByLabelText('Data de fim'), '2026-09-05')
    await user.type(screen.getByLabelText('Local'), 'Auditório')
    await user.type(screen.getByLabelText('Descrição'), 'Descrição do evento')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('A data de fim não pode ser anterior à data de início.')).toBeInTheDocument()
    expect(createEvent).not.toHaveBeenCalled()
  })

  it('creates the event and navigates back to the list', async () => {
    createEvent.mockResolvedValue({
      slug: 'evento-teste',
      title: 'Evento Teste',
      startDate: '2026-09-05',
      endDate: '2026-09-05',
      location: 'Auditório',
      type: 'workshop',
      description: 'Descrição do evento',
      featured: false,
    })
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Título'), 'Evento Teste')
    await user.type(screen.getByLabelText('Data de início'), '2026-09-05')
    await user.type(screen.getByLabelText('Data de fim'), '2026-09-05')
    await user.type(screen.getByLabelText('Local'), 'Auditório')
    await user.type(screen.getByLabelText('Descrição'), 'Descrição do evento')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(createEvent).toHaveBeenCalledWith(
        {
          title: 'Evento Teste',
          startDate: '2026-09-05',
          endDate: '2026-09-05',
          location: 'Auditório',
          type: 'workshop',
          description: 'Descrição do evento',
          featured: false,
        },
        'tok-1',
      )
    })
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/portal-equipe/eventos'))
  })
})
