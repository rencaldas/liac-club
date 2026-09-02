import { Link } from 'react-router-dom'
import type { NewsItem } from '../../types/entities'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { formatDateShort } from '../../utils/date'
import { truncate } from '../../utils/text'
import styles from './NewsCard.module.css'

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <Card className={styles.clickable}>
      {item.coverImageUrl && (
        <div className={styles.cover}>
          <img src={item.coverImageUrl} alt="" loading="lazy" />
        </div>
      )}
      <Badge>{item.category}</Badge>
      <h3 className={styles.title}>
        <Link to={`/novidades/${item.slug}`} className={styles.stretchedLink} draggable={false}>
          {item.title}
        </Link>
      </h3>
      <p className={styles.meta}>{formatDateShort(item.publishedAt)}</p>
      <p className={styles.summary}>{truncate(item.summary)}</p>
    </Card>
  )
}
