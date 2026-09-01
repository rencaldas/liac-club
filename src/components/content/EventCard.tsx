import { Link } from 'react-router-dom'
import type { Event } from '../../types/entities'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { formatEventDateRangeShort } from '../../utils/date'
import styles from './EventCard.module.css'

const EVENT_TYPE_LABELS: Record<Event['type'], string> = {
  workshop: 'Workshop',
  congresso: 'Congresso',
  palestra: 'Palestra',
}

interface EventCardProps {
  event: Event
  /** 'feature' renders a large, image-forward layout for the home carousel. */
  variant?: 'grid' | 'feature'
}

export function EventCard({ event, variant = 'grid' }: EventCardProps) {
  const details = (
    <>
      <Badge>{EVENT_TYPE_LABELS[event.type]}</Badge>
      <h3 className={styles.title}>
        <Link to={`/eventos/${event.slug}`} className={styles.stretchedLink}>
          {event.title}
        </Link>
      </h3>
      <p className={styles.meta}>{formatEventDateRangeShort(event.startDate, event.endDate)}</p>
      <p className={styles.meta}>{event.location}</p>
      <p className={styles.description}>{event.description}</p>
    </>
  )

  if (variant === 'feature') {
    return (
      <Card className={`${styles.clickable} ${styles.feature}`}>
        {event.coverImageUrl && (
          <div className={styles.featureCover}>
            <img src={event.coverImageUrl} alt="" loading="lazy" />
          </div>
        )}
        <div className={styles.body}>{details}</div>
      </Card>
    )
  }

  return (
    <Card className={styles.clickable}>
      {event.coverImageUrl && (
        <div className={styles.cover}>
          <img src={event.coverImageUrl} alt="" loading="lazy" />
        </div>
      )}
      {details}
    </Card>
  )
}
