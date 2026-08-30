import type { ReactNode } from 'react'
import styles from './Badge.module.css'

export function Badge({ children }: { children: ReactNode }) {
  return <span className={styles.badge}>{children}</span>
}
