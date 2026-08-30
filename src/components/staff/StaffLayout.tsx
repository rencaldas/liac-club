import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { hasAuditAccess, ROLE_LABELS } from '../../auth/roles'
import styles from './StaffLayout.module.css'

const BASE_NAV_ITEMS = [
  { to: '/portal-liac/novidades', label: 'Novidades' },
  { to: '/portal-liac/eventos', label: 'Eventos' },
  { to: '/portal-liac/artigos', label: 'Artigos' },
]

const AUDIT_NAV_ITEMS = [
  { to: '/portal-liac/equipe', label: 'Equipe' },
  { to: '/portal-liac/historico', label: 'Histórico' },
]

function linkClassName({ isActive }: { isActive: boolean }) {
  return isActive ? styles.navLinkActive : styles.navLink
}

export function StaffLayout() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const navItems = session && hasAuditAccess(session.role) ? [...BASE_NAV_ITEMS, ...AUDIT_NAV_ITEMS] : BASE_NAV_ITEMS

  async function handleLogout() {
    await logout()
    navigate('/portal-liac/login', { replace: true })
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <p className={styles.brand}>LIAC — Área da Equipe</p>
        <nav className={styles.nav} aria-label="Navegação da área da equipe">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClassName}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.userArea}>
          <span>
            {session?.displayName}
            {session && <span className={styles.roleTag}>{ROLE_LABELS[session.role]}</span>}
          </span>
          <button type="button" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
