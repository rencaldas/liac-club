import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EventsManageList } from './EventsManageList'
import { AuthProvider } from '../../../auth/AuthContext'
import { apiClient } from '../../../services/client'
import type { Event } from '../../../types/entities'

vi.mock('../../../services/client', () => ({
  apiClient: {
    getEvents: vi.fn(),
    deleteEvent: vi.fn(),
  },
}))

const getEvents = vi.mocked(apiClient.getEvents)
const deleteEvent = vi.mocked(apiClient.deleteEvent)

const STORAGE_KEY = 'liac_staff_session'

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    slug: 'evento-1',
    title: 'Evento 1',
    startDate: '2026-09-01',
    endDate: '2026-09-01',
    location: 'Local',
    type: 'workshop',
    description: 'Descrição',
    featured: false,
    ...overrides,
  }
}

function renderPage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: 'tok-1', role: 'coordenador', displayName: 'Fulana' }))
  return render(
    <MemoryRouter>
      <AuthProvider>
        <EventsManageList />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('EventsManageList', () => {
  beforeEach(() => {
    getEvents.mockReset()
    deleteEvent.mockReset()
    localStorage.clear()
  })

  it('lists the fetched events', async () => {
    getEvents.mockResolvedValue({ items: [makeEvent({ title: 'Workshop de Formulação' })], page: 1, pageSize: 100, total: 1 })
    renderPage()

    await waitFor(() => expect(screen.getByText('Workshop de Formulação')).toBeInTheDocument())
  })

  it('opens a confirmation dialog before deleting, and only deletes on confirm', async () => {
    getEvents.mockResolvedValue({ items: [makeEvent({ title: 'Para excluir' })], page: 1, pageSize: 100, total: 1 })
    deleteEvent.mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => expect(screen.getByText('Para excluir')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Excluir' }))

    const dialog = screen.getByRole('alertdialog')
    expect(deleteEvent).not.toHaveBeenCalled()

    await user.click(within(dialog).getByRole('button', { name: 'Excluir' }))

    await waitFor(() => expect(deleteEvent).toHaveBeenCalledWith('evento-1', 'tok-1'))
  })
})
