import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { apiClient } from '../../services/client'
import { useAsyncResource } from '../../hooks/useAsyncResource'
import { LoadingState } from '../../components/ui/LoadingState'
import { EmptyState } from '../../components/ui/EmptyState'
import { NotFound } from '../../components/ui/NotFound'
import { Badge } from '../../components/ui/Badge'
import { formatEventDateRangeShort } from '../../utils/date'
import type { Event } from '../../types/entities'
import styles from './EventDetail.module.css'

const EVENT_TYPE_LABELS: Record<Event['type'], string> = {
  workshop: 'Workshop',
  congresso: 'Congresso',
  palestra: 'Palestra',
}

export function EventDetail() {
  const { slug = '' } = useParams<{ slug: string }>()
  const fetchEvent = useCallback(() => apiClient.getEventBySlug(slug), [slug])
  const { status, data } = useAsyncResource<Event | null>(
    fetchEvent,
    [slug],
    (event) => event === null,
  )

  if (status === 'loading') {
    return (
      <div className="liac-container liac-page">
        <LoadingState label="Carregando evento…" />
      </div>
    )
  }

  if (status === 'empty') {
    return <NotFound message="Esse evento não existe ou foi removido." />
  }

  if (status === 'error' || !data) {
    return (
      <div className="liac-container liac-page">
        <EmptyState title="Não foi possível carregar esse evento. Tente novamente mais tarde." />
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
        <Badge>{EVENT_TYPE_LABELS[data.type]}</Badge>
        <h1>{data.title}</h1>
        <p className={styles.meta}>{formatEventDateRangeShort(data.startDate, data.endDate)}</p>
        <p className={styles.meta}>{data.location}</p>
        <p className={styles.description}>{data.description}</p>
      </article>
    </div>
  )
}
