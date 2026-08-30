import { LoginForm } from '../../../components/staff/LoginForm'
import styles from './Login.module.css'

export function Login() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <p className="liac-eyebrow">Área da Equipe</p>
        <h1>Entrar</h1>
        <LoginForm />
      </div>
    </div>
  )
}
