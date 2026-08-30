import { ContactForm } from '../../components/content/ContactForm'
import { InstagramIcon } from '../../components/ui/icons/InstagramIcon'
import { LinkedInIcon } from '../../components/ui/icons/LinkedInIcon'
import { WhatsAppIcon } from '../../components/ui/icons/WhatsAppIcon'
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

          <div className={styles.mapPlaceholder}>Mapa de localização (placeholder)</div>
        </div>
      </div>
    </div>
  )
}
