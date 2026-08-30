import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  as?: 'div' | 'article'
}

export function Card({ children, as = 'article', className, ...rest }: CardProps) {
  const Tag = as
  return (
    <Tag className={[styles.card, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </Tag>
  )
}
