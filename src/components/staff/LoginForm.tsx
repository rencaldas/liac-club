import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import styles from './LoginForm.module.css'

export function LoginForm() {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    try {
      await login({ email, password })
      const redirectTo =
        (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/portal-liac/novidades'
      navigate(redirectTo, { replace: true })
    } catch {
      setError('E-mail ou senha inválidos.')
    }
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
    </form>
  )
}
