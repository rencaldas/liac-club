import styles from './HomeMetrics.module.css'

/**
 * Fixed placeholder figures — no Metric entity exists in data-model.md, so these are static
 * demo content, not fetched from ApiClient. Replace with real numbers when available.
 */
const METRICS = [
  { value: '6', label: 'anos de atividade' },
  { value: '40+', label: 'membros ativos' },
  { value: '12', label: 'eventos realizados' },
  { value: '25+', label: 'artigos divulgados' },
]

export function HomeMetrics() {
  return (
    <section className={styles.section}>
      <div className={`liac-container ${styles.grid}`}>
        {METRICS.map((metric) => (
          <div key={metric.label}>
            <p className={styles.value}>{metric.value}</p>
            <p className={styles.label}>{metric.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
