import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EventDetail } from './EventDetail'
import { apiClient } from '../../services/client'

vi.mock('../../services/client', () => ({
  apiClient: {
    getEventBySlug: vi.fn(),
  },
}))

const getEventBySlug = vi.mocked(apiClient.getEventBySlug)

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/eventos/:slug" element={<EventDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('EventDetail', () => {
  beforeEach(() => {
    getEventBySlug.mockReset()
  })

  it('renders a multi-day event as a date range', async () => {
    getEventBySlug.mockResolvedValue({
      slug: 'simposio',
      title: 'Simpósio de Cosmetologia',
      startDate: '2026-08-18',
      endDate: '2026-08-20',
      location: 'Centro de Convenções',
      type: 'congresso',
      description: 'Descrição do simpósio.',
    })

    renderAt('/eventos/simposio')

    await waitFor(() => {
      expect(
        screen.getByText('18 de agosto de 2026 – 20 de agosto de 2026'),
      ).toBeInTheDocument()
    })
  })

  it('renders a not-found page for a slug that does not exist', async () => {
    getEventBySlug.mockResolvedValue(null)

    renderAt('/eventos/nao-existe')

    await waitFor(() => {
      expect(screen.getByText('404')).toBeInTheDocument()
    })
  })
})
