import { useCallback } from 'react'
import { apiClient } from '../../services/client'
import { useAsyncResource } from '../../hooks/useAsyncResource'
import { TeamMemberCard } from '../../components/content/TeamMemberCard'
import { LoadingState } from '../../components/ui/LoadingState'
import { EmptyState } from '../../components/ui/EmptyState'
import type { TeamMember } from '../../types/entities'
import styles from './Team.module.css'

function groupByArea(members: TeamMember[]): Map<string, TeamMember[]> {
  const groups = new Map<string, TeamMember[]>()
  for (const member of members) {
    const group = groups.get(member.area)
    if (group) {
      group.push(member)
    } else {
      groups.set(member.area, [member])
    }
  }
  return groups
}

export function Team() {
  const fetchTeam = useCallback(() => apiClient.getTeam(), [])
  const { status, data } = useAsyncResource(fetchTeam, [])

  return (
    <div className="liac-container liac-page">
      <header className="liac-page-header">
        <p className="liac-eyebrow">Quem faz a LIAC</p>
        <h1>Equipe</h1>
      </header>

      {status === 'loading' && <LoadingState label="Carregando equipe…" />}

      {status === 'empty' && <EmptyState title="Nenhum membro cadastrado no momento." />}

      {status === 'error' && (
        <EmptyState title="Não foi possível carregar a equipe. Tente novamente mais tarde." />
      )}

      {status === 'success' &&
        data &&
        Array.from(groupByArea(data)).map(([area, members]) => (
          <section key={area} className={styles.areaSection}>
            <h2 className={styles.areaTitle}>{area}</h2>
            <div className="liac-grid">
              {members.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          </section>
        ))}
    </div>
  )
}
