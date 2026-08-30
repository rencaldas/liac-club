import { Link } from 'react-router-dom'
import { InstagramIcon } from '../ui/icons/InstagramIcon'
import { LinkedInIcon } from '../ui/icons/LinkedInIcon'
import { WhatsAppIcon } from '../ui/icons/WhatsAppIcon'
import styles from './Footer.module.css'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={`liac-container ${styles.inner}`}>
        <div>
          <p className={styles.brand}>LIAC</p>
          <p>Liga Acadêmica de Cosmetologia da UFRJ — ciência cosmética acessível.</p>
        </div>

        <div>
          <h3>Links rápidos</h3>
          <ul className={styles.links}>
            <li>
              <Link to="/sobre">Sobre a LIAC</Link>
            </li>
            <li>
              <Link to="/eventos">Eventos</Link>
            </li>
            <li>
              <Link to="/artigos">Artigos Científicos</Link>
            </li>
            <li>
              <Link to="/contato">Contato</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3>Redes sociais</h3>
          <div className={styles.social}>
            <a
              href="https://instagram.com/liac.ufrj"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LIAC no Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://linkedin.com/company/liac-ufrj"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LIAC no LinkedIn"
            >
              <LinkedInIcon />
            </a>
            <a
              href="https://wa.me/5521999999999"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LIAC no WhatsApp"
            >
              <WhatsAppIcon />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        © {year} LIAC — Liga Acadêmica de Cosmetologia da UFRJ. Todos os direitos reservados.
      </div>
    </footer>
  )
}
