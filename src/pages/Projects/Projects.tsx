import { useCallback } from 'react'
import { apiClient } from '../../services/client'
import { useAsyncResource } from '../../hooks/useAsyncResource'
import { ProjectCard } from '../../components/content/ProjectCard'
import { LoadingState } from '../../components/ui/LoadingState'
import { EmptyState } from '../../components/ui/EmptyState'

export function Projects() {
  const fetchProjects = useCallback(() => apiClient.getProjects(), [])
  const { status, data } = useAsyncResource(fetchProjects, [])

  return (
    <div className="liac-container liac-page">
      <header className="liac-page-header">
        <p className="liac-eyebrow">Pesquisa Aplicada</p>
        <h1>Projetos de Pesquisa</h1>
      </header>

      {status === 'loading' && <LoadingState label="Carregando projetos…" />}

      {status === 'empty' && <EmptyState title="Nenhum projeto cadastrado no momento." />}

      {status === 'error' && (
        <EmptyState title="Não foi possível carregar os projetos. Tente novamente mais tarde." />
      )}

      {status === 'success' && data && (
        <div className="liac-grid">
          {data.items.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
