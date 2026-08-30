import type { ReactNode } from 'react'
import styles from './Badge.module.css'

interface BadgeProps {
  children: ReactNode
  className?: string
}

export function Badge({ children, className }: BadgeProps) {
  return <span className={[styles.badge, className].filter(Boolean).join(' ')}>{children}</span>
}
