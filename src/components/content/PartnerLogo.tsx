import type { Partner } from '../../types/entities'
import { Card } from '../ui/Card'
import styles from './PartnerLogo.module.css'

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return `${first}${last}`.toUpperCase()
}

export function PartnerLogo({ partner }: { partner: Partner }) {
  return (
    <a
      className={styles.link}
      href={partner.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${partner.name} (abre em nova aba)`}
    >
      <Card className={styles.card}>
        <div className={partner.logoUrl ? styles.media : `${styles.media} ${styles.mediaPlaceholder}`}>
          {partner.logoUrl ? (
            <img className={styles.logo} src={partner.logoUrl} alt={partner.name} />
          ) : (
            <div className={styles.placeholder} aria-hidden="true">
              {getInitials(partner.name)}
            </div>
          )}
        </div>
        <p className={styles.name}>{partner.name}</p>
      </Card>
    </a>
  )
}
