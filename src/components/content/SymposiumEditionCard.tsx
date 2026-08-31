import { Link } from 'react-router-dom'
import type { SymposiumEdition } from '../../types/entities'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { formatEventDateRange } from '../../utils/date'
import styles from './SymposiumEditionCard.module.css'

export function SymposiumEditionCard({ edition }: { edition: SymposiumEdition }) {
  return (
    <Card className={styles.clickable}>
      <Badge>{edition.year}</Badge>
      <h3 className={styles.title}>
        <Link to={`/edicoes-anteriores/${edition.slug}`} className={styles.stretchedLink}>
          {edition.title}
        </Link>
      </h3>
      <p className={styles.meta}>{formatEventDateRange(edition.startDate, edition.endDate)}</p>
      <p className={styles.meta}>{edition.location}</p>
      <p className={styles.description}>{edition.description}</p>
    </Card>
  )
}
