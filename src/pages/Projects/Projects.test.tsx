import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Projects } from './Projects'
import { apiClient } from '../../services/client'
import type { ResearchProject } from '../../types/entities'

vi.mock('../../services/client', () => ({
  apiClient: {
    getProjects: vi.fn(),
  },
}))

const getProjects = vi.mocked(apiClient.getProjects)

function makeProject(overrides: Partial<ResearchProject>): ResearchProject {
  return {
    id: 'p',
    title: 'Projeto',
    status: 'ativo',
    summary: 'Resumo',
    members: ['Autora'],
    ...overrides,
  }
}

describe('Projects', () => {
  beforeEach(() => {
    getProjects.mockReset()
  })

  it('renders a card per project once loaded', async () => {
    getProjects.mockResolvedValue({
      items: [
        makeProject({ id: 'a', title: 'Projeto A', status: 'ativo' }),
        makeProject({ id: 'b', title: 'Projeto B', status: 'concluído' }),
      ],
      page: 1,
      pageSize: 12,
      total: 2,
    })

    render(<Projects />)

    await waitFor(() => {
      expect(screen.getByText('Projeto A')).toBeInTheDocument()
    })
    expect(screen.getByText('Projeto B')).toBeInTheDocument()
  })

  it('shows an empty state when there are no projects', async () => {
    getProjects.mockResolvedValue({ items: [], page: 1, pageSize: 12, total: 0 })
    render(<Projects />)

    await waitFor(() => {
      expect(screen.getByText(/nenhum projeto cadastrado/i)).toBeInTheDocument()
    })
  })
})
