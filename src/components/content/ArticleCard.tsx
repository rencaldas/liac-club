import { Link } from 'react-router-dom'
import type { ScientificArticle } from '../../types/entities'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { formatAuthors } from '../../utils/text'
import styles from './ArticleCard.module.css'

export function ArticleCard({ article }: { article: ScientificArticle }) {
  return (
    <Card>
      <div className={styles.tags}>
        {article.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
      <h3 className={styles.title}>
        <Link to={`/artigos/${article.slug}`}>{article.title}</Link>
      </h3>
      <p className={styles.authors}>{formatAuthors(article.authors)}</p>
      <p className={styles.abstract}>{article.abstract}</p>
    </Card>
  )
}
