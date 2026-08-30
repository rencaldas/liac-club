import { useCallback } from 'react'
import { apiClient } from '../../services/client'
import { useAsyncResource } from '../../hooks/useAsyncResource'
import { NewsCard } from '../../components/content/NewsCard'
import { EventCard } from '../../components/content/EventCard'
import { ArticleCard } from '../../components/content/ArticleCard'
import { LoadingState } from '../../components/ui/LoadingState'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { Carousel } from '../../components/ui/Carousel'
import styles from './HomeHighlights.module.css'

const HIGHLIGHT_COUNT = 8

/** Prefers items marked `featured`; falls back to the full (chronological) list when none are. */
function pickFeatured<T extends { featured?: boolean }>(items: T[]): T[] {
  const featured = items.filter((item) => item.featured)
  return featured.length > 0 ? featured : items
}

function NewsHighlights() {
  const fetchNews = useCallback(() => apiClient.getNews({ pageSize: HIGHLIGHT_COUNT }), [])
  const { status, data } = useAsyncResource(fetchNews, [])

  return (
    <section className={styles.section}>
      <div className="liac-container">
        <div className={styles.sectionHeader}>
          <h2>Últimas novidades</h2>
          <Button to="/novidades" variant="secondary">
            Ver todas
          </Button>
        </div>
        {status === 'loading' && <LoadingState label="Carregando novidades…" />}
        {status === 'empty' && <EmptyState title="Ainda não há novidades publicadas." />}
        {status === 'success' && data && (
          <Carousel ariaLabel="Últimas novidades">
            {pickFeatured(data.items).map((item) => (
              <NewsCard key={item.slug} item={item} />
            ))}
          </Carousel>
        )}
      </div>
    </section>
  )
}

function EventHighlights() {
  const fetchEvents = useCallback(() => apiClient.getEvents({ pageSize: HIGHLIGHT_COUNT }), [])
  const { status, data } = useAsyncResource(fetchEvents, [])

  return (
    <section className={`${styles.section} ${styles.altBg}`}>
      <div className="liac-container">
        <div className={styles.sectionHeader}>
          <h2>Próximos eventos</h2>
          <Button to="/eventos" variant="secondary">
            Ver todos
          </Button>
        </div>
        {status === 'loading' && <LoadingState label="Carregando eventos…" />}
        {status === 'empty' && <EmptyState title="Nenhum evento cadastrado no momento." />}
        {status === 'success' && data && (
          <Carousel ariaLabel="Próximos eventos">
            {pickFeatured(data.items).map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </Carousel>
        )}
      </div>
    </section>
  )
}

function ArticleHighlights() {
  const fetchArticles = useCallback(
    () => apiClient.getArticles({ pageSize: HIGHLIGHT_COUNT }),
    [],
  )
  const { status, data } = useAsyncResource(fetchArticles, [])

  return (
    <section className={styles.section}>
      <div className="liac-container">
        <div className={styles.sectionHeader}>
          <h2>Artigos científicos em destaque</h2>
          <Button to="/artigos" variant="secondary">
            Ver todos
          </Button>
        </div>
        {status === 'loading' && <LoadingState label="Carregando artigos…" />}
        {status === 'empty' && <EmptyState title="Ainda não há artigos publicados." />}
        {status === 'success' && data && (
          <Carousel ariaLabel="Artigos científicos em destaque">
            {pickFeatured(data.items).map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </Carousel>
        )}
      </div>
    </section>
  )
}

export function HomeHighlights() {
  return (
    <>
      <NewsHighlights />
      <EventHighlights />
      <ArticleHighlights />
    </>
  )
}
