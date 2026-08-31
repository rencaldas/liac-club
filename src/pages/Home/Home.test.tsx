import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Home } from './Home'
import { apiClient } from '../../services/client'

vi.mock('../../services/client', () => ({
  apiClient: {
    getNews: vi.fn(),
    getEvents: vi.fn(),
    getArticles: vi.fn(),
    getSymposiumEditions: vi.fn(),
    getProjects: vi.fn(),
    getTestimonials: vi.fn(),
  },
}))

const emptyPage = { items: [], page: 1, pageSize: 3, total: 0 }

beforeEach(() => {
  vi.mocked(apiClient.getNews).mockResolvedValue(emptyPage)
  vi.mocked(apiClient.getEvents).mockResolvedValue(emptyPage)
  vi.mocked(apiClient.getArticles).mockResolvedValue(emptyPage)
  vi.mocked(apiClient.getSymposiumEditions).mockResolvedValue(emptyPage)
  vi.mocked(apiClient.getProjects).mockResolvedValue(emptyPage)
  vi.mocked(apiClient.getTestimonials).mockResolvedValue([])
})

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  )
}

describe('Home', () => {
  it('shows the hero heading and primary CTA linking to Contato', async () => {
    renderHome()

    // The hero itself renders synchronously, but let the three highlight sections' fetches
    // settle so their state updates don't leak into the next test as act() warnings.
    await waitFor(() => expect(screen.queryAllByRole('status')).toHaveLength(0))

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /divulgação científica em cosmetologia/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Fale Conosco' })).toHaveAttribute(
      'href',
      '/contato',
    )
  })

  it('shows a secondary CTA linking to Sobre a LIAC', async () => {
    renderHome()
    await waitFor(() => expect(screen.queryAllByRole('status')).toHaveLength(0))

    expect(screen.getByRole('link', { name: 'Conheça a LIAC' })).toHaveAttribute(
      'href',
      '/sobre',
    )
  })
})
