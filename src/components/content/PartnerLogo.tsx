import type { Partner } from '../../types/entities'
import styles from './PartnerLogo.module.css'

export function PartnerLogo({ partner }: { partner: Partner }) {
  return (
    <a
      className={styles.link}
      href={partner.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${partner.name} (abre em nova aba)`}
    >
      {partner.logoUrl ? (
        <img className={styles.logo} src={partner.logoUrl} alt={partner.name} />
      ) : (
        <span className={styles.namePlaceholder}>{partner.name}</span>
      )}
    </a>
  )
}
