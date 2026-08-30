import { Link } from 'react-router-dom'
import type { NewsItem } from '../../types/entities'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { formatDate } from '../../utils/date'
import styles from './NewsCard.module.css'

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <Card>
      <Badge>{item.category}</Badge>
      <h3 className={styles.title}>
        <Link to={`/novidades/${item.slug}`}>{item.title}</Link>
      </h3>
      <p className={styles.meta}>{formatDate(item.publishedAt)}</p>
      <p className={styles.summary}>{item.summary}</p>
    </Card>
  )
}
