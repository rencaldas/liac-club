import styles from './EmptyState.module.css'

interface EmptyStateProps {
  title: string
  description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className={styles.wrapper}>
      <p>
        <strong>{title}</strong>
      </p>
      {description && <p>{description}</p>}
    </div>
  )
}
