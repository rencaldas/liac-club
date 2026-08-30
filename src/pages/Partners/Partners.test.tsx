import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Partners } from './Partners'
import { apiClient } from '../../services/client'
import type { Partner } from '../../types/entities'

vi.mock('../../services/client', () => ({
  apiClient: {
    getPartners: vi.fn(),
  },
}))

const getPartners = vi.mocked(apiClient.getPartners)

function makePartner(overrides: Partial<Partner>): Partner {
  return {
    id: 'p',
    name: 'Parceiro',
    logoUrl: '',
    externalUrl: 'https://example.com',
    ...overrides,
  }
}

describe('Partners', () => {
  beforeEach(() => {
    getPartners.mockReset()
  })

  it('groups partners with a tier under their own heading, and untiered ones under "Outros Parceiros"', async () => {
    getPartners.mockResolvedValue([
      makePartner({ id: '1', name: 'Institucional A', tier: 'Parceiro Institucional' }),
      makePartner({ id: '2', name: 'Apoiador A', tier: 'Apoiador' }),
      makePartner({ id: '3', name: 'Sem Nível' }),
    ])

    render(<Partners />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Parceiro Institucional' })).toBeInTheDocument()
    })
    expect(screen.getByRole('heading', { name: 'Apoiador' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Outros Parceiros' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sem nível/i })).toBeInTheDocument()
  })

  it('shows an empty state when there are no partners', async () => {
    getPartners.mockResolvedValue([])
    render(<Partners />)

    await waitFor(() => {
      expect(screen.getByText(/nenhum parceiro cadastrado/i)).toBeInTheDocument()
    })
  })
})
