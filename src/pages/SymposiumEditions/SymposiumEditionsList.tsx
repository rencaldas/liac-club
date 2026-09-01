import { useCallback } from 'react'
import { apiClient } from '../../services/client'
import { useAsyncResource } from '../../hooks/useAsyncResource'
import { SymposiumEditionCard } from '../../components/content/SymposiumEditionCard'
import { LoadingState } from '../../components/ui/LoadingState'
import { EmptyState } from '../../components/ui/EmptyState'

export function SymposiumEditionsList() {
  const fetchEditions = useCallback(() => apiClient.getSymposiumEditions({ pageSize: 100 }), [])
  const { status, data } = useAsyncResource(fetchEditions, [])

  return (
    <div className="liac-container liac-page">
      <header className="liac-page-header">
        <p className="liac-eyebrow">Simpósio LIAC</p>
        <h1>Edições Anteriores</h1>
      </header>

      {status === 'loading' && <LoadingState label="Carregando edições…" />}

      {status === 'empty' && <EmptyState title="Nenhuma edição registrada no momento." />}

      {status === 'error' && (
        <EmptyState title="Não foi possível carregar as edições. Tente novamente mais tarde." />
      )}

      {status === 'success' && data && (
        <div className="liac-grid">
          {data.items.map((edition) => (
            <SymposiumEditionCard key={edition.slug} edition={edition} />
          ))}
        </div>
      )}
    </div>
  )
}
