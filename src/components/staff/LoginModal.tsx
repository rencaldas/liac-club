import { useEffect, useRef, useState } from 'react'
import { LoginForm } from './LoginForm'
import styles from './LoginModal.module.css'

interface LoginModalProps {
  onClose: () => void
}

export function LoginModal({ onClose }: LoginModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const [view, setView] = useState<'login' | 'forgot'>('login')

  useEffect(() => {
    closeRef.current?.focus()
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className={styles.backdrop} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
        <button type="button" ref={closeRef} className={styles.close} onClick={onClose} aria-label="Fechar">
          ×
        </button>
        {view === 'login' && <p className="liac-eyebrow">Área da Equipe</p>}
        <h2 id="login-modal-title">{view === 'forgot' ? 'Esqueci minha senha' : 'Entrar'}</h2>
        <LoginForm onSuccess={onClose} onViewChange={setView} />
      </div>
    </div>
  )
}
