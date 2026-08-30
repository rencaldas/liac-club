import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { About } from './About'

describe('About', () => {
  it('shows the mission and history sections', () => {
    render(<About />)

    expect(screen.getByRole('heading', { name: 'Missão' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'História' })).toBeInTheDocument()
  })

  it('shows the UFRJ institutional affiliation seal', () => {
    render(<About />)

    expect(
      screen.getByText('Liga vinculada à Universidade Federal do Rio de Janeiro'),
    ).toBeInTheDocument()
    expect(screen.getByText('UFRJ')).toBeInTheDocument()
  })
})
