import { useCallback, useState, type FormEvent } from 'react'
import { apiClient } from '../../services/client'
import { useAsyncResource } from '../../hooks/useAsyncResource'
import { ArticleCard } from '../../components/content/ArticleCard'
import { LoadingState } from '../../components/ui/LoadingState'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import styles from './ArticlesList.module.css'

interface Filters {
  tag: string
  author: string
}

const EMPTY_FILTERS: Filters = { tag: '', author: '' }

export function ArticlesList() {
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS)
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS)

  const fetchArticles = useCallback(
    () =>
      apiClient.getArticles({
        tag: applied.tag || undefined,
        author: applied.author || undefined,
      }),
    [applied],
  )
  const { status, data } = useAsyncResource(fetchArticles, [applied])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setApplied(draft)
  }

  function handleClear() {
    setDraft(EMPTY_FILTERS)
    setApplied(EMPTY_FILTERS)
  }

  const hasActiveFilters = applied.tag !== '' || applied.author !== ''

  return (
    <div className="liac-container liac-page">
      <header className="liac-page-header">
        <p className="liac-eyebrow">Ciência Acessível</p>
        <h1>Artigos Científicos</h1>
      </header>

      <form className={styles.filters} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="filter-tag">Tema</label>
          <input
            id="filter-tag"
            type="text"
            value={draft.tag}
            onChange={(event) => setDraft((prev) => ({ ...prev, tag: event.target.value }))}
            placeholder="ex: colágeno"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="filter-author">Autor</label>
          <input
            id="filter-author"
            type="text"
            value={draft.author}
            onChange={(event) => setDraft((prev) => ({ ...prev, author: event.target.value }))}
            placeholder="ex: Ramos"
          />
        </div>
        <div className={styles.actions}>
          <Button type="submit">Filtrar</Button>
          {hasActiveFilters && (
            <Button type="button" variant="secondary" onClick={handleClear}>
              Limpar filtros
            </Button>
          )}
        </div>
      </form>

      {status === 'loading' && <LoadingState label="Carregando artigos…" />}

      {status === 'empty' && (
        <EmptyState
          title={
            hasActiveFilters
              ? 'Nenhum artigo encontrado para esse filtro.'
              : 'Ainda não há artigos publicados.'
          }
          description={
            hasActiveFilters
              ? 'Tente outro tema ou autor.'
              : 'Volte em breve para conferir as próximas divulgações científicas da LIAC.'
          }
        />
      )}

      {status === 'error' && (
        <EmptyState title="Não foi possível carregar os artigos. Tente novamente mais tarde." />
      )}

      {status === 'success' && data && (
        <div className="liac-grid">
          {data.items.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
