import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import styles from './PageLayout.module.css'

export function PageLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className={isHome ? `${styles.page} ${styles.pageHome}` : styles.page}>
      <Navbar onHero={isHome} />
      <main className={isHome ? `${styles.main} ${styles.mainFlush}` : styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
