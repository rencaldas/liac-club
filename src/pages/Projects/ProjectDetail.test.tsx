import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProjectDetail } from './ProjectDetail'
import { apiClient } from '../../services/client'

vi.mock('../../services/client', () => ({
  apiClient: {
    getProjectById: vi.fn(),
  },
}))

const getProjectById = vi.mocked(apiClient.getProjectById)

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/projetos/:id" element={<ProjectDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProjectDetail', () => {
  beforeEach(() => {
    getProjectById.mockReset()
  })

  it('renders the full summary and team of an existing project', async () => {
    getProjectById.mockResolvedValue({
      id: 'proj-abc',
      title: 'Projeto existente',
      status: 'ativo',
      summary: 'Resumo completo do projeto de pesquisa.',
      members: ['Ana Ramos', 'Carla Menezes'],
      publishedAt: '2026-08-15',
    })

    renderAt('/projetos/proj-abc')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Projeto existente' })).toBeInTheDocument()
    })
    expect(screen.getByText('Resumo completo do projeto de pesquisa.')).toBeInTheDocument()
    expect(screen.getByText('Equipe:')).toBeInTheDocument()
    expect(screen.getByText('Ana Ramos, Carla Menezes')).toBeInTheDocument()
    expect(screen.getByText('15/08/2026')).toBeInTheDocument()
  })

  it('renders a not-found page for an id that does not exist', async () => {
    getProjectById.mockResolvedValue(null)

    renderAt('/projetos/nao-existe')

    await waitFor(() => {
      expect(screen.getByText('404')).toBeInTheDocument()
    })
  })
})
