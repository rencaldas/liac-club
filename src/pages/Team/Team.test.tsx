import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Team } from './Team'
import { apiClient } from '../../services/client'
import type { TeamMember } from '../../types/entities'

vi.mock('../../services/client', () => ({
  apiClient: {
    getTeam: vi.fn(),
  },
}))

const getTeam = vi.mocked(apiClient.getTeam)

function makeMember(overrides: Partial<TeamMember>): TeamMember {
  return {
    id: 'm',
    name: 'Nome',
    role: 'Cargo',
    area: 'Área',
    socialLinks: [],
    ...overrides,
  }
}

describe('Team', () => {
  beforeEach(() => {
    getTeam.mockReset()
  })

  it('groups members by area under their own heading', async () => {
    getTeam.mockResolvedValue([
      makeMember({ id: '1', name: 'Mariana Costa', area: 'Diretoria Executiva' }),
      makeMember({ id: '2', name: 'Júlia Ferreira', area: 'Marketing' }),
      makeMember({ id: '3', name: 'Ana Beatriz Ramos', area: 'Pesquisa' }),
      makeMember({ id: '4', name: 'Carla Menezes', area: 'Pesquisa' }),
    ])

    render(<Team />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Pesquisa' })).toBeInTheDocument()
    })
    expect(screen.getByRole('heading', { name: 'Diretoria Executiva' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Marketing' })).toBeInTheDocument()
    expect(screen.getByText('Ana Beatriz Ramos')).toBeInTheDocument()
    expect(screen.getByText('Carla Menezes')).toBeInTheDocument()
  })

  it('shows an empty state when there are no team members', async () => {
    getTeam.mockResolvedValue([])
    render(<Team />)

    await waitFor(() => {
      expect(screen.getByText(/nenhum membro cadastrado/i)).toBeInTheDocument()
    })
  })
})
