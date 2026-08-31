import { ContactForm } from '../../components/content/ContactForm'
import { InstagramIcon } from '../../components/ui/icons/InstagramIcon'
import { LinkedInIcon } from '../../components/ui/icons/LinkedInIcon'
import styles from './Contact.module.css'

export function Contact() {
  return (
    <div className="liac-container liac-page">
      <header className="liac-page-header">
        <p className="liac-eyebrow">Fale Conosco</p>
        <h1>Contato</h1>
      </header>

      <div className={styles.layout}>
        <ContactForm />

        <div className={styles.info}>
          <h2>Onde estamos</h2>
          <address>
            Liga Acadêmica de Cosmetologia da UFRJ
            <br />
            Faculdade de Farmácia — Cidade Universitária
            <br />
            Rio de Janeiro, RJ
          </address>

          <h2>Redes sociais</h2>
          <div className={styles.social}>
            <a
              href="https://www.instagram.com/liac_ufrj?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LIAC no Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://www.linkedin.com/company/liac-ufrj/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LIAC no LinkedIn"
            >
              <LinkedInIcon />
            </a>
          </div>

          <div className={styles.mapPlaceholder}>Mapa de localização (placeholder)</div>
        </div>
      </div>
    </div>
  )
}
