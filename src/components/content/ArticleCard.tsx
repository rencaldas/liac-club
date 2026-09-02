import { Link } from 'react-router-dom'
import type { ScientificArticle } from '../../types/entities'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { formatAuthors, truncate } from '../../utils/text'
import { formatDateShort } from '../../utils/date'
import styles from './ArticleCard.module.css'

export function ArticleCard({ article }: { article: ScientificArticle }) {
  return (
    <Card className={styles.clickable}>
      <div className={styles.tags}>
        {article.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
      <h3 className={styles.title}>
        <Link to={`/artigos/${article.slug}`} className={styles.stretchedLink} draggable={false}>
          {article.title}
        </Link>
      </h3>
      <p className={styles.authors}>
        <span className={styles.authorsLabel}>Publicado por:</span> {formatAuthors(article.authors)}
      </p>
      {formatDateShort(article.publishedAt) && (
        <p className={styles.date}>{formatDateShort(article.publishedAt)}</p>
      )}
      <p className={styles.abstract}>{truncate(article.abstract)}</p>
    </Card>
  )
}
