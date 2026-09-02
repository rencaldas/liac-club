import { Link } from 'react-router-dom'
import type { SymposiumEdition } from '../../types/entities'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { formatEventDateRangeShort } from '../../utils/date'
import { truncate } from '../../utils/text'
import styles from './SymposiumEditionCard.module.css'

export function SymposiumEditionCard({ edition }: { edition: SymposiumEdition }) {
  return (
    <Card className={styles.clickable}>
      <Badge>{edition.year}</Badge>
      <h3 className={styles.title}>
        <Link to={`/edicoes-anteriores/${edition.slug}`} className={styles.stretchedLink} draggable={false}>
          {edition.title}
        </Link>
      </h3>
      <p className={styles.meta}>{formatEventDateRangeShort(edition.startDate, edition.endDate)}</p>
      <p className={styles.meta}>{edition.location}</p>
      <p className={styles.description}>{truncate(edition.description)}</p>
    </Card>
  )
}
