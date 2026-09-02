import { Link } from 'react-router-dom'
import type { ResearchProject } from '../../types/entities'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { truncate } from '../../utils/text'
import { formatDateShort } from '../../utils/date'
import styles from './ProjectCard.module.css'

const STATUS_LABELS: Record<ResearchProject['status'], string> = {
  ativo: 'Ativo',
  concluído: 'Concluído',
}

export function ProjectCard({ project }: { project: ResearchProject }) {
  return (
    <Card className={styles.clickable}>
      <Badge className={project.status === 'concluído' ? styles.statusConcluido : undefined}>
        {STATUS_LABELS[project.status]}
      </Badge>
      <h3 className={styles.title}>
        <Link to={`/projetos/${project.id}`} className={styles.stretchedLink} draggable={false}>
          {project.title}
        </Link>
      </h3>
      <p className={styles.members}>
        <span className={styles.membersLabel}>Equipe:</span> {project.members.join(', ')}
      </p>
      {formatDateShort(project.publishedAt ?? '') && (
        <p className={styles.date}>{formatDateShort(project.publishedAt ?? '')}</p>
      )}
      <p className={styles.summary}>{truncate(project.summary)}</p>
    </Card>
  )
}
