import type { ResearchProject } from '../../types/entities'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import styles from './ProjectCard.module.css'

const STATUS_LABELS: Record<ResearchProject['status'], string> = {
  ativo: 'Ativo',
  concluído: 'Concluído',
}

export function ProjectCard({ project }: { project: ResearchProject }) {
  return (
    <Card>
      <Badge className={project.status === 'concluído' ? styles.statusConcluido : undefined}>
        {STATUS_LABELS[project.status]}
      </Badge>
      <h3 className={styles.title}>{project.title}</h3>
      <p className={styles.summary}>{project.summary}</p>
      <p className={styles.members}>{project.members.join(', ')}</p>
    </Card>
  )
}
