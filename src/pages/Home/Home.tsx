import { Button } from '../../components/ui/Button'
import { HomeHighlights } from './HomeHighlights'
import { HomeMetrics } from './HomeMetrics'
import styles from './Home.module.css'

export function Home() {
  return (
    <>
      <section className={styles.hero}>
        <div className="liac-container">
          <p className={`liac-eyebrow ${styles.heroEyebrow}`}>Da ciência ao dia a dia</p>
          <h1>Divulgação científica em cosmetologia, feita pela UFRJ</h1>
          <p>
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
      </section>

      <HomeHighlights />
      <HomeMetrics />
    </>
  )
}
