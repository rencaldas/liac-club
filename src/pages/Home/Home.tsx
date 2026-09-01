import { Button } from '../../components/ui/Button'
import { Reveal } from '../../components/ui/Reveal'
import { ScrollProgress } from '../../components/ui/ScrollProgress'
import { HomeHighlights } from './HomeHighlights'
import liacLogo from '../../../docs/brand/liac-logo-2-white.png'
import styles from './Home.module.css'

export function Home() {
  return (
    <>
      <ScrollProgress />

      <section className={styles.hero}>
        <div className={`liac-container ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <Reveal variant="fade-up">
              <p className={`liac-eyebrow ${styles.heroEyebrow}`}>Da ciência ao dia a dia</p>
            </Reveal>
            <Reveal variant="fade-up" delay={90}>
              <h1>Divulgação científica em cosmetologia, feita pela UFRJ</h1>
            </Reveal>
            <Reveal variant="fade-up" delay={180}>
              <p className={styles.heroText}>
                A LIAC conecta a pesquisa acadêmica em cosmetologia da UFRJ ao público, através de
                eventos, artigos e novidades que traduzem ciência em conteúdo acessível.
              </p>
            </Reveal>
            <Reveal variant="fade-up" delay={270}>
              <div className={styles.heroActions}>
                <Button to="/contato">Fale Conosco</Button>
                <Button to="/sobre" variant="secondary" className={styles.heroSecondary}>
                  Conheça a LIAC
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal variant="fade-up" delay={120} className={styles.heroLogoReveal}>
            <div className={styles.heroLogo}>
              <img src={liacLogo} alt="LIAC — Liga Acadêmica de Cosmetologia UFRJ" />
            </div>
          </Reveal>
        </div>
      </section>

      <HomeHighlights />
    </>
  )
}
