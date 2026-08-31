import type { FormEvent, ReactNode } from 'react'
import styles from './EntityFormLayout.module.css'

interface EntityFormLayoutProps {
  title: string
  onSubmit: (event: FormEvent) => void
  onCancel: () => void
  isSubmitting: boolean
  submitLabel?: string
  generalError?: string | null
  successMessage?: string | null
  children: ReactNode
}

export function EntityFormLayout({
  title,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = 'Salvar',
  generalError,
  successMessage,
  children,
}: EntityFormLayoutProps) {
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <h1>{title}</h1>

      {generalError && (
        <p className={styles.errorBanner} role="alert">
          {generalError}
        </p>
      )}

      {successMessage && (
        <p className={styles.successBanner} role="status">
          {successMessage}
        </p>
      )}

      <div className={styles.fields}>{children}</div>

      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </button>
        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? 'Salvando…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
