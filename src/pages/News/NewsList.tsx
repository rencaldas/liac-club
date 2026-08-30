import { useCallback } from 'react'
import { apiClient } from '../../services/client'
import { useAsyncResource } from '../../hooks/useAsyncResource'
import { NewsCard } from '../../components/content/NewsCard'
import { LoadingState } from '../../components/ui/LoadingState'
import { EmptyState } from '../../components/ui/EmptyState'

export function NewsList() {
  const fetchNews = useCallback(() => apiClient.getNews(), [])
  const { status, data } = useAsyncResource(fetchNews, [])

  return (
    <div className="liac-container liac-page">
      <header className="liac-page-header">
        <p className="liac-eyebrow">Divulgação Científica</p>
        <h1>Novidades</h1>
      </header>

      {status === 'loading' && <LoadingState label="Carregando novidades…" />}

      {status === 'empty' && (
        <EmptyState
          title="Ainda não há novidades publicadas."
          description="Volte em breve para acompanhar as próximas divulgações da LIAC."
        />
      )}

      {status === 'error' && (
        <EmptyState title="Não foi possível carregar as novidades. Tente novamente mais tarde." />
      )}

      {status === 'success' && data && (
        <div className="liac-grid">
          {data.items.map((item) => (
            <NewsCard key={item.slug} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
