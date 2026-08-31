import { useEffect, useRef, useState, type FocusEvent, type MouseEvent } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { MenuIcon, CloseIcon } from '../ui/icons/MenuIcon'
import { LoginModal } from '../staff/LoginModal'
import liacLogo from '../../../docs/brand/liac-logo-2.png'
import styles from './Navbar.module.css'

type NavLeaf = { type: 'link'; to: string; label: string; end?: boolean }
type NavGroup = { type: 'group'; label: string; children: { to: string; label: string }[] }
type NavEntry = NavLeaf | NavGroup

const NAV_ITEMS: NavEntry[] = [
  { type: 'link', to: '/', label: 'Início', end: true },
  { type: 'link', to: '/sobre', label: 'Sobre' },
  { type: 'link', to: '/equipe', label: 'Equipe' },
  {
    type: 'group',
    label: 'Conteúdo',
    children: [
      { to: '/eventos', label: 'Eventos' },
      { to: '/artigos', label: 'Artigos' },
      { to: '/novidades', label: 'Novidades' },
      { to: '/edicoes-anteriores', label: 'Edições Anteriores do Simpósio' },
      { to: '/projetos', label: 'Projetos' },
    ],
  },
  { type: 'link', to: '/parceiros', label: 'Parceiros' },
  { type: 'link', to: '/contato', label: 'Contato' },
]

const MOBILE_ITEMS: NavLeaf[] = NAV_ITEMS.flatMap((item) =>
  item.type === 'link'
    ? [item]
    : item.children.map((child) => ({ type: 'link' as const, end: false, ...child })),
)

function linkClassName({ isActive }: { isActive: boolean }) {
  return isActive ? styles.linkActive : undefined
}

type Indicator = { left: number; width: number; opacity: number }

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [indicator, setIndicator] = useState<Indicator>({ left: 0, width: 0, opacity: 0 })
  const navListRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleLinkHover(
    event: MouseEvent<HTMLAnchorElement | HTMLButtonElement> | FocusEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) {
    const container = navListRef.current
    if (!container) return
    const containerRect = container.getBoundingClientRect()
    const linkRect = event.currentTarget.getBoundingClientRect()
    const inset = parseFloat(getComputedStyle(event.currentTarget).paddingLeft) || 0
    setIndicator({
      left: linkRect.left - containerRect.left + inset,
      width: linkRect.width - inset * 2,
      opacity: 1,
    })
  }

  function hideIndicator() {
    setIndicator((prev) => ({ ...prev, opacity: 0 }))
  }

  return (
    <header className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand} onClick={() => setIsOpen(false)}>
          <img src={liacLogo} alt="LIAC — Liga Acadêmica de Cosmetologia UFRJ" />
        </NavLink>

        <div className={styles.navList} ref={navListRef} onMouseLeave={hideIndicator}>
          <span
            className={styles.indicator}
            style={{
              transform: `translateX(${indicator.left}px)`,
              width: indicator.width,
              opacity: indicator.opacity,
            }}
            aria-hidden="true"
          />
          <ul className={styles.links}>
            {NAV_ITEMS.map((item) =>
              item.type === 'link' ? (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={linkClassName}
                    onMouseEnter={handleLinkHover}
                    onFocus={handleLinkHover}
                    onBlur={hideIndicator}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ) : (
                <li key={item.label} className={styles.navGroup}>
                  <button
                    type="button"
                    className={
                      item.children.some((child) => location.pathname.startsWith(child.to))
                        ? styles.linkActive
                        : undefined
                    }
                    onMouseEnter={handleLinkHover}
                    onFocus={handleLinkHover}
                    onBlur={hideIndicator}
                  >
                    {item.label}
                    <svg
                      className={styles.groupArrow}
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <ul className={styles.dropdown}>
                    {item.children.map((child) => (
                      <li key={child.to}>
                        <NavLink to={child.to} className={linkClassName}>
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
              ),
            )}
          </ul>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.loginButton} onClick={() => setIsLoginOpen(true)}>
            Portal da Equipe
          </button>

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
      </div>

      {isOpen && (
        <nav id="mobile-menu" className={styles.mobileMenu} aria-label="Navegação principal">
          {MOBILE_ITEMS.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={linkClassName}
              style={{ animationDelay: `${index * 30}ms` }}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <button
            type="button"
            style={{ animationDelay: `${MOBILE_ITEMS.length * 30}ms` }}
            onClick={() => {
              setIsOpen(false)
              setIsLoginOpen(true)
            }}
          >
            Entrar no Portal LIAC
          </button>
        </nav>
      )}

      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} />}
    </header>
  )
}
