import { useCallback, useState } from 'react'
import { apiClient } from '../../services/client'
import { useAsyncResource } from '../../hooks/useAsyncResource'
import { EventCard } from '../../components/content/EventCard'
import { LoadingState } from '../../components/ui/LoadingState'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import styles from './EventsList.module.css'

type WhenFilter = 'upcoming' | 'past'

const FILTER_LABELS: Record<WhenFilter, string> = {
  upcoming: 'Futuros',
  past: 'Passados',
}

export function EventsList() {
  const [when, setWhen] = useState<WhenFilter>('upcoming')
  const fetchEvents = useCallback(() => apiClient.getEvents({ when }), [when])
  const { status, data } = useAsyncResource(fetchEvents, [when])

  return (
    <div className="liac-container liac-page">
      <header className="liac-page-header">
        <p className="liac-eyebrow">Agenda LIAC</p>
        <h1>Eventos</h1>
      </header>

      <div className={styles.filters} role="group" aria-label="Filtrar eventos por período">
        {(['upcoming', 'past'] as WhenFilter[]).map((option) => (
          <Button
            key={option}
            type="button"
            variant={when === option ? 'primary' : 'secondary'}
            aria-pressed={when === option}
            onClick={() => setWhen(option)}
          >
            {FILTER_LABELS[option]}
          </Button>
        ))}
      </div>

      {status === 'loading' && <LoadingState label="Carregando eventos…" />}

      {status === 'empty' && (
        <EmptyState
          title={
            when === 'upcoming'
              ? 'Nenhum evento futuro no momento.'
              : 'Nenhum evento passado registrado.'
          }
          description="Volte em breve para conferir a agenda atualizada da LIAC."
        />
      )}

      {status === 'error' && (
        <EmptyState title="Não foi possível carregar os eventos. Tente novamente mais tarde." />
      )}

      {status === 'success' && data && (
        <div className="liac-grid">
          {data.items.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
