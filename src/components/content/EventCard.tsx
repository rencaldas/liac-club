import { Link } from 'react-router-dom'
import type { Event } from '../../types/entities'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { formatEventDateRange } from '../../utils/date'
import styles from './EventCard.module.css'

const EVENT_TYPE_LABELS: Record<Event['type'], string> = {
  workshop: 'Workshop',
  congresso: 'Congresso',
  palestra: 'Palestra',
}

export function EventCard({ event }: { event: Event }) {
  return (
    <Card>
      <Badge>{EVENT_TYPE_LABELS[event.type]}</Badge>
      <h3 className={styles.title}>
        <Link to={`/eventos/${event.slug}`}>{event.title}</Link>
      </h3>
      <p className={styles.meta}>{formatEventDateRange(event.startDate, event.endDate)}</p>
      <p className={styles.meta}>{event.location}</p>
      <p className={styles.description}>{event.description}</p>
    </Card>
  )
}
