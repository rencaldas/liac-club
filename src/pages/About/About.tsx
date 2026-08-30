import styles from './About.module.css'

export function About() {
  return (
    <div className="liac-container liac-page">
      <header className="liac-page-header">
        <p className="liac-eyebrow">Sobre a Liga</p>
        <h1>Sobre a LIAC</h1>
      </header>

      <div className={styles.content}>
        <section>
          <h2>Missão</h2>
          <p>
            A Liga Acadêmica de Cosmetologia da UFRJ (LIAC) existe para aproximar a ciência
            cosmética produzida na universidade do público — traduzindo pesquisa em conteúdo
            acessível, sem perder rigor técnico. Acreditamos que divulgação científica de
            qualidade é parte do trabalho de quem faz ciência, não um extra.
          </p>
        </section>

        <section>
          <h2>História</h2>
          <p>
            Nascida dentro da Faculdade de Farmácia da UFRJ, a LIAC reúne estudantes interessados
            em cosmetologia para além da sala de aula — organizando palestras quinzenais, oficinas
            práticas e o tradicional Simpósio de Cosmetologia, além de manter uma equipe de
            pesquisa e uma equipe de marketing dedicadas a transformar artigos científicos em
            conteúdo para redes sociais.
          </p>
        </section>

        <section className={styles.affiliation}>
          <div className={styles.seal} aria-hidden="true">
            UFRJ
          </div>
          <div className={styles.affiliationText}>
            <p>Liga vinculada à Universidade Federal do Rio de Janeiro</p>
            <p>Faculdade de Farmácia — Cidade Universitária, Rio de Janeiro</p>
          </div>
        </section>
      </div>
    </div>
  )
}
