import { useState, type FormEvent } from 'react'
import { apiClient } from '../../services/client'
import styles from './ForgotPasswordForm.module.css'

interface ForgotPasswordFormProps {
  onBack: () => void
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const redirectTo = `${window.location.origin}/definir-senha`
      await apiClient.requestPasswordReset(email, redirectTo)
    } catch {
      // Deliberately silent: the confirmation message below never reveals whether the e-mail
      // is registered, so a failed request looks identical to a successful one to the caller.
    } finally {
      setIsSubmitting(false)
      setIsSent(true)
    }
  }

  if (isSent) {
    return (
      <>
        <p className={styles.confirmation}>
          Se o e-mail informado estiver cadastrado, enviamos um link para redefinir a senha.
        </p>
        <button type="button" className={styles.backLink} onClick={onBack}>
          Voltar para o login
        </button>
      </>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="forgot-email">E-mail</label>
        <input
          id="forgot-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onBack}>
          Voltar
        </button>
        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? 'Enviando…' : 'Enviar link'}
        </button>
      </div>
    </form>
  )
}
