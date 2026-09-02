import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { apiClient } from '../../services/client'
import { useAsyncResource } from '../../hooks/useAsyncResource'
import { LoadingState } from '../../components/ui/LoadingState'
import { EmptyState } from '../../components/ui/EmptyState'
import { NotFound } from '../../components/ui/NotFound'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { formatDateShort } from '../../utils/date'
import type { ResearchProject } from '../../types/entities'
import styles from './ProjectDetail.module.css'

const STATUS_LABELS: Record<ResearchProject['status'], string> = {
  ativo: 'Ativo',
  concluído: 'Concluído',
}

export function ProjectDetail() {
  const { id = '' } = useParams<{ id: string }>()
  const fetchProject = useCallback(() => apiClient.getProjectById(id), [id])
  const { status, data } = useAsyncResource<ResearchProject | null>(
    fetchProject,
    [id],
    (project) => project === null,
  )

  if (status === 'loading') {
    return (
      <div className="liac-container liac-page">
        <LoadingState label="Carregando projeto…" />
      </div>
    )
  }

  if (status === 'empty') {
    return <NotFound message="Esse projeto não existe ou foi removido." />
  }

  if (status === 'error' || !data) {
    return (
      <div className="liac-container liac-page">
        <EmptyState title="Não foi possível carregar esse projeto. Tente novamente mais tarde." />
      </div>
    )
  }

  return (
    <div className="liac-container liac-page">
      <article className={styles.article}>
        <Badge className={data.status === 'concluído' ? styles.statusConcluido : undefined}>
          {STATUS_LABELS[data.status]}
        </Badge>
        <h1>{data.title}</h1>
        {data.members.length > 0 && (
          <p className={styles.members}>
            <span className={styles.membersLabel}>Equipe:</span> {data.members.join(', ')}
          </p>
        )}
        {formatDateShort(data.publishedAt ?? '') && (
          <p className={styles.date}>{formatDateShort(data.publishedAt ?? '')}</p>
        )}
        <p className={styles.summary}>{data.summary}</p>
        <Button to="/projetos" variant="secondary" className={styles.back}>
          Ver todos os projetos
        </Button>
      </article>
    </div>
  )
}
