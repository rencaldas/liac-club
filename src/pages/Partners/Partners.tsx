import { useCallback } from 'react'
import { apiClient } from '../../services/client'
import { useAsyncResource } from '../../hooks/useAsyncResource'
import { PartnerLogo } from '../../components/content/PartnerLogo'
import { LoadingState } from '../../components/ui/LoadingState'
import { EmptyState } from '../../components/ui/EmptyState'
import type { Partner } from '../../types/entities'
import styles from './Partners.module.css'

const UNTIERED_LABEL = 'Outros Parceiros'

function groupByTier(partners: Partner[]): Map<string, Partner[]> {
  const groups = new Map<string, Partner[]>()
  for (const partner of partners) {
    const tier = partner.tier ?? UNTIERED_LABEL
    const group = groups.get(tier)
    if (group) {
      group.push(partner)
    } else {
      groups.set(tier, [partner])
    }
  }
  return groups
}

export function Partners() {
  const fetchPartners = useCallback(() => apiClient.getPartners(), [])
  const { status, data } = useAsyncResource(fetchPartners, [])

  return (
    <div className="liac-container liac-page">
      <header className="liac-page-header">
        <p className="liac-eyebrow">Quem Apoia a LIAC</p>
        <h1>Parceiros</h1>
      </header>

      {status === 'loading' && <LoadingState label="Carregando parceiros…" />}

      {status === 'empty' && <EmptyState title="Nenhum parceiro cadastrado no momento." />}

      {status === 'error' && (
        <EmptyState title="Não foi possível carregar os parceiros. Tente novamente mais tarde." />
      )}

      {status === 'success' &&
        data &&
        Array.from(groupByTier(data)).map(([tier, partners]) => (
          <section key={tier} className={styles.tierSection}>
            <h2 className={styles.tierTitle}>{tier}</h2>
            <div className={styles.logoGrid}>
              {partners.map((partner) => (
                <PartnerLogo key={partner.id} partner={partner} />
              ))}
            </div>
          </section>
        ))}
    </div>
  )
}
