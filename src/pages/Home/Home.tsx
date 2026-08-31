import { Button } from '../../components/ui/Button'
import { HomeHighlights } from './HomeHighlights'
import liacLogo from '../../../docs/brand/liac-logo-2-white.png'
import styles from './Home.module.css'

export function Home() {
  return (
    <>
      <section className={styles.hero}>
        <div className={`liac-container ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <p className={`liac-eyebrow ${styles.heroEyebrow}`}>Da ciência ao dia a dia</p>
            <h1>Divulgação científica em cosmetologia, feita pela UFRJ</h1>
            <p className={styles.heroText}>
              A LIAC conecta a pesquisa acadêmica em cosmetologia da UFRJ ao público — através de
              eventos, artigos e novidades que traduzem ciência em conteúdo acessível.
            </p>
            <div className={styles.heroActions}>
              <Button to="/contato">Fale Conosco</Button>
              <Button to="/sobre" variant="secondary" className={styles.heroSecondary}>
                Conheça a LIAC
              </Button>
            </div>
          </div>

          <div className={styles.heroLogo}>
            <img src={liacLogo} alt="LIAC — Liga Acadêmica de Cosmetologia UFRJ" />
          </div>
        </div>
      </section>

      <HomeHighlights />
    </>
  )
}
