import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { EventCard } from './EventCard'
import type { Event } from '../../types/entities'

function renderEvent(event: Event) {
  return render(
    <MemoryRouter>
      <EventCard event={event} />
    </MemoryRouter>,
  )
}

describe('EventCard', () => {
  it('shows a single date when the event lasts one day', () => {
    renderEvent({
      slug: 'workshop-um-dia',
      title: 'Workshop de um dia',
      startDate: '2026-09-12',
      endDate: '2026-09-12',
      location: 'Laboratório A',
      type: 'workshop',
      description: 'Descrição do workshop.',
    })

    expect(screen.getByText('12/09/2026')).toBeInTheDocument()
    expect(screen.getByText('Workshop')).toBeInTheDocument()
  })

  it('shows a date range when the event spans multiple days', () => {
    renderEvent({
      slug: 'simposio-2026',
      title: 'Simpósio 2026',
      startDate: '2026-08-18',
      endDate: '2026-08-20',
      location: 'Centro de Convenções',
      type: 'congresso',
      description: 'Descrição do simpósio.',
    })

    expect(screen.getByText('18/08/2026 à 20/08/2026')).toBeInTheDocument()
  })

  it('links to the event detail page', () => {
    renderEvent({
      slug: 'palestra-x',
      title: 'Palestra X',
      startDate: '2026-07-15',
      endDate: '2026-07-15',
      location: 'Auditório',
      type: 'palestra',
      description: 'Descrição.',
    })

    expect(screen.getByRole('link', { name: 'Palestra X' })).toHaveAttribute(
      'href',
      '/eventos/palestra-x',
    )
  })
})
