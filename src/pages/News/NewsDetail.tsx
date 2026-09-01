import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { apiClient } from '../../services/client'
import { useAsyncResource } from '../../hooks/useAsyncResource'
import { LoadingState } from '../../components/ui/LoadingState'
import { EmptyState } from '../../components/ui/EmptyState'
import { NotFound } from '../../components/ui/NotFound'
import { Badge } from '../../components/ui/Badge'
import { formatDateShort } from '../../utils/date'
import type { NewsItem } from '../../types/entities'
import styles from './NewsDetail.module.css'

export function NewsDetail() {
  const { slug = '' } = useParams<{ slug: string }>()
  const fetchNewsItem = useCallback(() => apiClient.getNewsBySlug(slug), [slug])
  const { status, data } = useAsyncResource<NewsItem | null>(
    fetchNewsItem,
    [slug],
    (item) => item === null,
  )

  if (status === 'loading') {
    return (
      <div className="liac-container liac-page">
        <LoadingState label="Carregando novidade…" />
      </div>
    )
  }

  if (status === 'empty') {
    return <NotFound message="Essa novidade não existe ou foi removida." />
  }

  if (status === 'error' || !data) {
    return (
      <div className="liac-container liac-page">
        <EmptyState title="Não foi possível carregar essa novidade. Tente novamente mais tarde." />
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
        <Badge>{data.category}</Badge>
        <h1>{data.title}</h1>
        <p className={styles.meta}>{formatDateShort(data.publishedAt)}</p>
        <p className={styles.content}>{data.content}</p>
      </article>
    </div>
  )
}
