import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EventsList } from './EventsList'
import { apiClient } from '../../services/client'
import type { Event } from '../../types/entities'

vi.mock('../../services/client', () => ({
  apiClient: {
    getEvents: vi.fn(),
  },
}))

const getEvents = vi.mocked(apiClient.getEvents)

function makeEvent(overrides: Partial<Event>): Event {
  return {
    slug: 'evento',
    title: 'Evento',
    startDate: '2026-09-01',
    endDate: '2026-09-01',
    location: 'Local',
    type: 'workshop',
    description: 'Descrição',
    ...overrides,
  }
}

function renderPage() {
  return render(
    <MemoryRouter>
      <EventsList />
    </MemoryRouter>,
  )
}

describe('EventsList', () => {
  beforeEach(() => {
    getEvents.mockReset()
    getEvents.mockResolvedValue({ items: [], page: 1, pageSize: 12, total: 0 })
  })

  it('fetches upcoming events by default', async () => {
    renderPage()

    await waitFor(() => {
      expect(getEvents).toHaveBeenCalledWith({ when: 'upcoming' })
    })
  })

  it('refetches with the past filter when toggled', async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => expect(getEvents).toHaveBeenCalled())
    await user.click(screen.getByRole('button', { name: 'Passados' }))

    await waitFor(() => {
      expect(getEvents).toHaveBeenLastCalledWith({ when: 'past' })
    })
  })

  it('renders a card per event once loaded', async () => {
    getEvents.mockResolvedValue({
      items: [makeEvent({ slug: 'a', title: 'Workshop A' })],
      page: 1,
      pageSize: 12,
      total: 1,
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Workshop A')).toBeInTheDocument()
    })
  })
})
