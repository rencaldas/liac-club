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
import { formatAuthors } from '../../utils/text'
import { formatDateShort } from '../../utils/date'
import type { ScientificArticle } from '../../types/entities'
import styles from './ArticleDetail.module.css'

export function ArticleDetail() {
  const { slug = '' } = useParams<{ slug: string }>()
  const fetchArticle = useCallback(() => apiClient.getArticleBySlug(slug), [slug])
  const { status, data } = useAsyncResource<ScientificArticle | null>(
    fetchArticle,
    [slug],
    (article) => article === null,
  )

  if (status === 'loading') {
    return (
      <div className="liac-container liac-page">
        <LoadingState label="Carregando artigo…" />
      </div>
    )
  }

  if (status === 'empty') {
    return <NotFound message="Esse artigo não existe ou foi removido." />
  }

  if (status === 'error' || !data) {
    return (
      <div className="liac-container liac-page">
        <EmptyState title="Não foi possível carregar esse artigo. Tente novamente mais tarde." />
      </div>
    )
  }

  return (
    <div className="liac-container liac-page">
      <article className={styles.article}>
        <div className={styles.tags}>
          {data.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
        <h1>{data.title}</h1>
        <p className={styles.authors}>
          <span className={styles.authorsLabel}>Publicado por:</span> {formatAuthors(data.authors)}
        </p>
        <p className={styles.date}>{formatDateShort(data.publishedAt)}</p>
        <p className={styles.abstract}>{data.abstract}</p>
        <Button href={data.externalUrl} variant="secondary" className={styles.externalLink}>
          Ver artigo original
          <ExternalLinkIcon />
        </Button>
      </article>
    </div>
  )
}
