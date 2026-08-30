import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../../services/client'
import { useAuth } from '../../auth/AuthContext'
import styles from './SetPassword.module.css'

function readAccessToken(): string | null {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
  return new URLSearchParams(hash).get('access_token')
}

export function SetPassword() {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const token = useMemo(readAccessToken, [])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (!token) {
      setError('Link de convite inválido ou expirado.')
      return
    }

    setIsSubmitting(true)
    try {
      const session = await apiClient.setPassword(token, password)
      setSession(session)
      navigate('/portal-liac/novidades', { replace: true })
    } catch {
      setError('Não foi possível definir a senha. O link pode ter expirado — peça um novo convite.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <p className="liac-eyebrow">Área da Equipe</p>
        <h1>Defina sua senha</h1>

        {!token ? (
          <p className={styles.errorText} role="alert">
            Link de convite inválido ou expirado. Peça à Diretoria para reenviar o convite.
          </p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label htmlFor="new-password">Nova senha</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="confirm-password">Confirmar senha</label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>
            {error && (
              <p className={styles.errorText} role="alert">
                {error}
              </p>
            )}
            <button type="submit" className={styles.submit} disabled={isSubmitting}>
              {isSubmitting ? 'Salvando…' : 'Salvar e entrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
