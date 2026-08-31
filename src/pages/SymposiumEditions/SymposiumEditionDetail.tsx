import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { apiClient } from '../../services/client'
import { useAsyncResource } from '../../hooks/useAsyncResource'
import { LoadingState } from '../../components/ui/LoadingState'
import { EmptyState } from '../../components/ui/EmptyState'
import { NotFound } from '../../components/ui/NotFound'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ExternalLinkIcon } from '../../components/ui/icons/ExternalLinkIcon'
import { formatEventDateRange } from '../../utils/date'
import type { SymposiumEdition } from '../../types/entities'
import styles from './SymposiumEditionDetail.module.css'

export function SymposiumEditionDetail() {
  const { slug = '' } = useParams<{ slug: string }>()
  const fetchEdition = useCallback(() => apiClient.getSymposiumEditionBySlug(slug), [slug])
  const { status, data } = useAsyncResource<SymposiumEdition | null>(
    fetchEdition,
    [slug],
    (edition) => edition === null,
  )

  if (status === 'loading') {
    return (
      <div className="liac-container liac-page">
        <LoadingState label="Carregando edição…" />
      </div>
    )
  }

  if (status === 'empty') {
    return <NotFound message="Essa edição não existe ou foi removida." />
  }

  if (status === 'error' || !data) {
    return (
      <div className="liac-container liac-page">
        <EmptyState title="Não foi possível carregar essa edição. Tente novamente mais tarde." />
      </div>
    )
  }

  return (
    <div className="liac-container liac-page">
      <article className={styles.article}>
        {data.coverImageUrl && (
          <div className={styles.cover}>
            <img src={data.coverImageUrl} alt="" />
          </div>
        )}
        <Badge>{data.year}</Badge>
        <h1>{data.title}</h1>
        <p className={styles.meta}>{formatEventDateRange(data.startDate, data.endDate)}</p>
        <p className={styles.meta}>{data.location}</p>
        <p className={styles.description}>{data.description}</p>
        {data.externalUrl && (
          <Button href={data.externalUrl} variant="secondary" className={styles.externalLink}>
            Ver mais sobre essa edição
            <ExternalLinkIcon />
          </Button>
        )}
      </article>
    </div>
  )
}
