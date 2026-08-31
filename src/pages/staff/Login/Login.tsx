import { useState } from 'react'
import { LoginForm } from '../../../components/staff/LoginForm'
import liacLogo from '../../../../docs/brand/liac-logo-2.png'
import styles from './Login.module.css'

export function Login() {
  const [view, setView] = useState<'login' | 'forgot'>('login')

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img src={liacLogo} alt="LIAC" className={styles.logo} />
        {view === 'login' && <p className="liac-eyebrow">Área da Equipe</p>}
        <h1>{view === 'forgot' ? 'Esqueci minha senha' : 'Entrar'}</h1>
        <LoginForm onViewChange={setView} />
      </div>
    </div>
  )
}
