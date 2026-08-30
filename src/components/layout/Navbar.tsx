import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { MenuIcon, CloseIcon } from '../ui/icons/MenuIcon'
import styles from './Navbar.module.css'

const NAV_ITEMS = [
  { to: '/', label: 'Início', end: true },
  { to: '/sobre', label: 'Sobre' },
  { to: '/equipe', label: 'Equipe' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/artigos', label: 'Artigos' },
  { to: '/novidades', label: 'Novidades' },
  { to: '/projetos', label: 'Projetos' },
  { to: '/parceiros', label: 'Parceiros' },
  { to: '/contato', label: 'Contato' },
]

function linkClassName({ isActive }: { isActive: boolean }) {
  return isActive ? styles.linkActive : undefined
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className={styles.navbar}>
      <div className={`liac-container ${styles.inner}`}>
        <NavLink to="/" className={styles.brand} onClick={() => setIsOpen(false)}>
          LIAC Club
        </NavLink>

        <ul className={styles.links}>
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} className={linkClassName}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className={styles.toggle}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {isOpen && (
        <nav id="mobile-menu" className={styles.mobileMenu} aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={linkClassName}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
