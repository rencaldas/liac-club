import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import styles from './LoginForm.module.css'

type LoginFormView = 'login' | 'forgot'

interface LoginFormProps {
  /** Called right after a successful login (e.g. so a wrapping modal can close itself). */
  onSuccess?: () => void
  /** Called whenever the form switches between the login and forgot-password views (e.g. so a wrapping modal can update its title). */
  onViewChange?: (view: LoginFormView) => void
}

export function LoginForm({ onSuccess, onViewChange }: LoginFormProps) {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<LoginFormView>('login')

  function showView(next: LoginFormView) {
    setView(next)
    onViewChange?.(next)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    try {
      await login({ email, password })
      const redirectTo =
        (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/portal-liac/novidades'
      navigate(redirectTo, { replace: true })
      onSuccess?.()
    } catch {
      setError('E-mail ou senha inválidos.')
    }
  }

  if (view === 'forgot') {
    return <ForgotPasswordForm onBack={() => showView('login')} />
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="staff-email">E-mail</label>
        <input
          id="staff-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="staff-password">Senha</label>
        <input
          id="staff-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      {error && (
        <p className={styles.errorText} role="alert">
          {error}
        </p>
      )}

      <button type="submit" className={styles.submit} disabled={isLoading}>
        {isLoading ? 'Entrando…' : 'Entrar'}
      </button>

      <button type="button" className={styles.forgotLink} onClick={() => showView('forgot')}>
        Esqueci minha senha
      </button>
    </form>
  )
}
