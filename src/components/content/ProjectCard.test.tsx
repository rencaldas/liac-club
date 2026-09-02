import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
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
    publishedAt: '2026-08-15',
    ...overrides,
  }
}

function renderCard(project: ResearchProject) {
  return render(
    <MemoryRouter>
      <ProjectCard project={project} />
    </MemoryRouter>,
  )
}

describe('ProjectCard', () => {
  it('shows the title, status, summary, team and publish date', () => {
    renderCard(makeProject({ status: 'ativo' }))

    expect(screen.getByRole('heading', { name: 'Projeto de teste' })).toBeInTheDocument()
    expect(screen.getByText('Ativo')).toBeInTheDocument()
    expect(screen.getByText('Resumo do projeto.')).toBeInTheDocument()
    expect(screen.getByText('Equipe:')).toBeInTheDocument()
    expect(screen.getByText('Ana Beatriz Ramos, Carla Menezes')).toBeInTheDocument()
    expect(screen.getByText('15/08/2026')).toBeInTheDocument()
  })

  it('omits the date line when the project has no publish date', () => {
    renderCard(makeProject({ publishedAt: undefined }))

    expect(screen.queryByText(/\d{2}\/\d{2}\/\d{4}/)).not.toBeInTheDocument()
  })

  it('links to the project detail page', () => {
    renderCard(makeProject({ id: 'proj-abc' }))

    expect(screen.getByRole('link', { name: 'Projeto de teste' })).toHaveAttribute(
      'href',
      '/projetos/proj-abc',
    )
  })

  it('labels a concluded project as "Concluído"', () => {
    renderCard(makeProject({ status: 'concluído' }))

    expect(screen.getByText('Concluído')).toBeInTheDocument()
  })
})
