import { apiClient } from '../../services/client'
import { useAsyncResource } from '../../hooks/useAsyncResource'
import { LoadingState } from '../../components/ui/LoadingState'
import styles from './HomeMetrics.module.css'

const FOUNDING_YEAR = 2020

interface Counts {
  members: number
  pastEvents: number
  articles: number
}

async function fetchCounts(): Promise<Counts> {
  const [team, events, articles] = await Promise.all([
    apiClient.getTeam(),
    apiClient.getEvents({ when: 'past', pageSize: 1 }),
    apiClient.getArticles({ pageSize: 1 }),
  ])
  return { members: team.length, pastEvents: events.total, articles: articles.total }
}

export function HomeMetrics() {
  const { status, data } = useAsyncResource(fetchCounts, [], () => false)

  if (status === 'error') return null

  const yearsActive = new Date().getFullYear() - FOUNDING_YEAR
  const metrics = [
    { value: String(yearsActive), label: 'anos de atividade' },
    { value: data ? String(data.members) : '—', label: 'membros ativos' },
    { value: data ? String(data.pastEvents) : '—', label: 'eventos realizados' },
    { value: data ? String(data.articles) : '—', label: 'artigos divulgados' },
  ]

  return (
    <section className={styles.section}>
      <div className="liac-container">
        {status === 'loading' && <LoadingState label="Carregando números da LIAC…" />}
        {status === 'success' && (
          <div className={styles.grid}>
            {metrics.map((metric) => (
              <div key={metric.label}>
                <p className={styles.value}>{metric.value}</p>
                <p className={styles.label}>{metric.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
