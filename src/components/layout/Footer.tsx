import { Link } from 'react-router-dom'
import { apiClient } from '../../services/client'
import { useAsyncResource } from '../../hooks/useAsyncResource'
import { InstagramIcon } from '../ui/icons/InstagramIcon'
import { LinkedInIcon } from '../ui/icons/LinkedInIcon'
import styles from './Footer.module.css'

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

function FooterMetrics() {
  const { status, data } = useAsyncResource(fetchCounts, [], () => false)

  if (status === 'error' || status === 'loading') return null

  const yearsActive = new Date().getFullYear() - FOUNDING_YEAR
  const metrics = [
    { value: String(yearsActive), label: 'anos de atividade' },
    { value: data ? String(data.members) : '—', label: 'membros ativos' },
    { value: data ? String(data.pastEvents) : '—', label: 'eventos realizados' },
    { value: data ? String(data.articles) : '—', label: 'artigos divulgados' },
  ]

  return (
    <div className={styles.metrics}>
      {metrics.map((metric) => (
        <div key={metric.label}>
          <p className={styles.metricValue}>{metric.value}</p>
          <p className={styles.metricLabel}>{metric.label}</p>
        </div>
      ))}
    </div>
  )
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className="liac-container">
        <FooterMetrics />
      </div>

      <div className={`liac-container ${styles.inner}`}>
        <div>
          <p className={styles.brand}>LIAC</p>
          <p>Liga Acadêmica de Cosmetologia da UFRJ — ciência cosmética acessível.</p>
        </div>

        <div>
          <h3>Links rápidos</h3>
          <ul className={styles.links}>
            <li>
              <Link to="/sobre">Sobre a LIAC</Link>
            </li>
            <li>
              <Link to="/eventos">Eventos</Link>
            </li>
            <li>
              <Link to="/artigos">Artigos Científicos</Link>
            </li>
            <li>
              <Link to="/contato">Contato</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3>Redes sociais</h3>
          <div className={styles.social}>
            <a
              href="https://www.instagram.com/liac_ufrj?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LIAC no Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://www.linkedin.com/company/liac-ufrj/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LIAC no LinkedIn"
            >
              <LinkedInIcon />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        © {year} LIAC — Liga Acadêmica de Cosmetologia da UFRJ. Todos os direitos reservados.
      </div>
    </footer>
  )
}
