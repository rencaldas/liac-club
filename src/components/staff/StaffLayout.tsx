import { useEffect, useState, type ReactElement } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { hasAuditAccess, hasPartnerManagementAccess, ROLE_LABELS } from '../../auth/roles'
import type { StaffRole } from '../../types/entities'
import {
  ArticleIcon,
  ChevronsLeftIcon,
  EventIcon,
  HistoryIcon,
  LogoutIcon,
  NewsIcon,
  PartnerIcon,
  ProjectIcon,
  SymposiumIcon,
  TeamIcon,
} from '../ui/icons/StaffIcons'
import { MenuIcon, CloseIcon } from '../ui/icons/MenuIcon'
import liacLogo from '../../../docs/brand/liac-logo-2.png'
import styles from './StaffLayout.module.css'

interface NavItem {
  to: string
  label: string
  icon: (props: { className?: string }) => ReactElement
  access: (role: StaffRole) => boolean
}

const CONTENT_NAV_ITEMS: NavItem[] = [
  { to: '/portal-liac/novidades', label: 'Novidades', icon: NewsIcon, access: () => true },
  { to: '/portal-liac/eventos', label: 'Eventos', icon: EventIcon, access: () => true },
  { to: '/portal-liac/artigos', label: 'Artigos', icon: ArticleIcon, access: () => true },
  { to: '/portal-liac/edicoes-anteriores', label: 'Edições Anteriores', icon: SymposiumIcon, access: () => true },
  { to: '/portal-liac/projetos', label: 'Projetos', icon: ProjectIcon, access: () => true },
]

const MANAGEMENT_NAV_ITEMS: NavItem[] = [
  { to: '/portal-liac/equipe', label: 'Equipe', icon: TeamIcon, access: hasAuditAccess },
  { to: '/portal-liac/parceiros', label: 'Parceiros', icon: PartnerIcon, access: hasPartnerManagementAccess },
  { to: '/portal-liac/historico', label: 'Histórico', icon: HistoryIcon, access: hasAuditAccess },
]

function linkClassName({ isActive }: { isActive: boolean }) {
  return isActive ? styles.navLinkActive : styles.navLink
}

export function StaffLayout() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const managementItems = session ? MANAGEMENT_NAV_ITEMS.filter((item) => item.access(session.role)) : []
  const allItems = [...CONTENT_NAV_ITEMS, ...managementItems]
  const currentLabel = allItems.find((item) => location.pathname.startsWith(item.to))?.label ?? 'Área da Equipe'

  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  async function handleLogout() {
    await logout()
    navigate('/portal-liac/login', { replace: true })
  }

  function renderNavList(items: NavItem[]) {
    return (
      <ul className={styles.navList}>
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.to}>
              <NavLink to={item.to} className={linkClassName} title={isCollapsed ? item.label : undefined}>
                <Icon className={styles.navIcon} />
                <span className={styles.navLabel}>{item.label}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className={`${styles.shell} ${isCollapsed ? styles.collapsed : ''}`}>
      {isMobileOpen && (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Fechar menu"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`${styles.sidebar} ${isMobileOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHead}>
          <NavLink to="/portal-liac/novidades" className={styles.brand}>
            <img src={liacLogo} alt="LIAC" />
            <span className={styles.brandText}>Portal LIAC</span>
          </NavLink>
          <button
            type="button"
            className={styles.mobileClose}
            aria-label="Fechar menu"
            onClick={() => setIsMobileOpen(false)}
          >
            <CloseIcon width={20} height={20} />
          </button>
        </div>

        <nav className={styles.nav} aria-label="Navegação da área da equipe">
          <p className={styles.navGroupLabel}>
            <span className={styles.navLabel}>Conteúdo</span>
          </p>
          {renderNavList(CONTENT_NAV_ITEMS)}

          {managementItems.length > 0 && (
            <>
              <p className={styles.navGroupLabel}>
                <span className={styles.navLabel}>Gestão</span>
              </p>
              {renderNavList(managementItems)}
            </>
          )}
        </nav>

        <div className={styles.sidebarFoot}>
          <button
            type="button"
            className={styles.collapseToggle}
            onClick={() => setIsCollapsed((value) => !value)}
            aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            <ChevronsLeftIcon className={styles.collapseIcon} />
            <span className={styles.navLabel}>Recolher menu</span>
          </button>

          <div className={styles.userCard}>
            <NavLink
              to="/portal-liac/perfil"
              className={styles.avatar}
              title="Editar perfil"
              aria-label="Editar perfil"
            >
              {session?.photoUrl ? (
                <img src={session.photoUrl} alt="" className={styles.avatarImage} />
              ) : (
                <span aria-hidden="true">{session?.displayName?.charAt(0).toUpperCase() ?? '?'}</span>
              )}
            </NavLink>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{session?.displayName}</span>
              {session && <span className={styles.roleTag}>{ROLE_LABELS[session.role]}</span>}
            </div>
            <button type="button" className={styles.logoutButton} onClick={handleLogout} title="Sair" aria-label="Sair">
              <LogoutIcon />
            </button>
          </div>
        </div>
      </aside>

      <div className={styles.contentArea}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.mobileToggle}
            aria-label="Abrir menu"
            onClick={() => setIsMobileOpen(true)}
          >
            <MenuIcon width={22} height={22} />
          </button>
          <h1 className={styles.pageTitle}>{currentLabel}</h1>
        </header>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
