import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProjectCard } from './ProjectCard'
import type { ResearchProject } from '../../types/entities'

function makeProject(overrides: Partial<ResearchProject>): ResearchProject {
  return {
    id: 'p1',
    title: 'Projeto de teste',
    status: 'ativo',
    summary: 'Resumo do projeto.',
    members: ['Ana Beatriz Ramos', 'Carla Menezes'],
    ...overrides,
  }
}

describe('ProjectCard', () => {
  it('shows the title, status, summary and members', () => {
    render(<ProjectCard project={makeProject({ status: 'ativo' })} />)

    expect(screen.getByRole('heading', { name: 'Projeto de teste' })).toBeInTheDocument()
    expect(screen.getByText('Ativo')).toBeInTheDocument()
    expect(screen.getByText('Resumo do projeto.')).toBeInTheDocument()
    expect(screen.getByText('Ana Beatriz Ramos, Carla Menezes')).toBeInTheDocument()
  })

  it('labels a concluded project as "Concluído"', () => {
    render(<ProjectCard project={makeProject({ status: 'concluído' })} />)

    expect(screen.getByText('Concluído')).toBeInTheDocument()
  })
})
