import { useCallback } from 'react'
import { apiClient } from '../../services/client'
import { useAsyncResource } from '../../hooks/useAsyncResource'
import { NewsCard } from '../../components/content/NewsCard'
import { EventCard } from '../../components/content/EventCard'
import { ArticleCard } from '../../components/content/ArticleCard'
import { SymposiumEditionCard } from '../../components/content/SymposiumEditionCard'
import { ProjectCard } from '../../components/content/ProjectCard'
import { TestimonialCard } from '../../components/content/TestimonialCard'
import { LoadingState } from '../../components/ui/LoadingState'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { Carousel } from '../../components/ui/Carousel'
import { Reveal } from '../../components/ui/Reveal'
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
        <Reveal variant="slide-left" className={styles.sectionHeader}>
          <h2>Últimas novidades</h2>
          <Button to="/novidades" variant="secondary">
            Ver todas
          </Button>
        </Reveal>
        {status === 'loading' && <LoadingState label="Carregando novidades…" />}
        {status === 'empty' && <EmptyState title="Ainda não há novidades publicadas." />}
        {status === 'success' && data && (
          <Reveal variant="slide-right" delay={120}>
            <Carousel ariaLabel="Últimas novidades">
              {pickFeatured(data.items).map((item) => (
                <NewsCard key={item.slug} item={item} />
              ))}
            </Carousel>
          </Reveal>
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
        <Reveal variant="fade-up" className={styles.sectionHeader}>
          <h2>Próximos eventos</h2>
          <Button to="/eventos" variant="secondary">
            Ver todos
          </Button>
        </Reveal>
        {status === 'loading' && <LoadingState label="Carregando eventos…" />}
        {status === 'empty' && <EmptyState title="Nenhum evento cadastrado no momento." />}
        {status === 'success' && data && (
          <Reveal variant="zoom" delay={120}>
            <Carousel ariaLabel="Próximos eventos" slideClassName={styles.eventSlide}>
              {pickFeatured(data.items).map((event) => (
                <EventCard key={event.slug} event={event} variant="feature" />
              ))}
            </Carousel>
          </Reveal>
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
        <Reveal variant="slide-right" className={styles.sectionHeader}>
          <h2>Artigos científicos em destaque</h2>
          <Button to="/artigos" variant="secondary">
            Ver todos
          </Button>
        </Reveal>
        {status === 'loading' && <LoadingState label="Carregando artigos…" />}
        {status === 'empty' && <EmptyState title="Ainda não há artigos publicados." />}
        {status === 'success' && data && (
          <Reveal variant="slide-left" delay={120}>
            <Carousel ariaLabel="Artigos científicos em destaque">
              {pickFeatured(data.items).map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </Carousel>
          </Reveal>
        )}
      </div>
    </section>
  )
}

function SymposiumEditionHighlights() {
  const fetchEditions = useCallback(
    () => apiClient.getSymposiumEditions({ pageSize: HIGHLIGHT_COUNT }),
    [],
  )
  const { status, data } = useAsyncResource(fetchEditions, [])

  return (
    <section className={`${styles.section} ${styles.altBg}`}>
      <div className="liac-container">
        <Reveal variant="fade-up" className={styles.sectionHeader}>
          <h2>Edições anteriores</h2>
          <Button to="/edicoes-anteriores" variant="secondary">
            Ver todas
          </Button>
        </Reveal>
        {status === 'loading' && <LoadingState label="Carregando edições…" />}
        {status === 'empty' && <EmptyState title="Ainda não há edições registradas." />}
        {status === 'success' && data && (
          <Reveal variant="flip-up" delay={120}>
            <Carousel ariaLabel="Edições anteriores">
              {pickFeatured(data.items).map((edition) => (
                <SymposiumEditionCard key={edition.slug} edition={edition} />
              ))}
            </Carousel>
          </Reveal>
        )}
      </div>
    </section>
  )
}

function ProjectHighlights() {
  const fetchProjects = useCallback(() => apiClient.getProjects({ pageSize: HIGHLIGHT_COUNT }), [])
  const { status, data } = useAsyncResource(fetchProjects, [])

  return (
    <section className={styles.section}>
      <div className="liac-container">
        <Reveal variant="slide-left" className={styles.sectionHeader}>
          <h2>Projetos de pesquisa</h2>
          <Button to="/projetos" variant="secondary">
            Ver todos
          </Button>
        </Reveal>
        {status === 'loading' && <LoadingState label="Carregando projetos…" />}
        {status === 'empty' && <EmptyState title="Ainda não há projetos cadastrados." />}
        {status === 'success' && data && (
          <Reveal variant="fade-up" delay={120}>
            <Carousel ariaLabel="Projetos de pesquisa">
              {data.items.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </Carousel>
          </Reveal>
        )}
      </div>
    </section>
  )
}

function TestimonialHighlights() {
  const fetchTestimonials = useCallback(() => apiClient.getTestimonials(), [])
  const { status, data } = useAsyncResource(fetchTestimonials, [])

  return (
    <section className={`${styles.section} ${styles.altBg}`}>
      <div className="liac-container">
        <Reveal variant="fade-up" className={styles.sectionHeader}>
          <h2>Depoimentos de ligantes</h2>
        </Reveal>
        {status === 'loading' && <LoadingState label="Carregando depoimentos…" />}
        {status === 'empty' && <EmptyState title="Ainda não há depoimentos cadastrados." />}
        {status === 'success' && data && (
          <Reveal variant="zoom" delay={120}>
            <Carousel ariaLabel="Depoimentos de ligantes">
              {data.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </Carousel>
          </Reveal>
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
      <SymposiumEditionHighlights />
      <ProjectHighlights />
      <TestimonialHighlights />
    </>
  )
}
