import styles from './LoadingState.module.css'

export function LoadingState({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className="liac-visually-hidden">{label}</span>
    </div>
  )
}
