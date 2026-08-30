import type { TeamMember } from '../../types/entities'
import { Card } from '../ui/Card'
import { InstagramIcon } from '../ui/icons/InstagramIcon'
import { LinkedInIcon } from '../ui/icons/LinkedInIcon'
import styles from './TeamMemberCard.module.css'

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return `${first}${last}`.toUpperCase()
}

export function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <Card className={styles.card}>
      {member.photoUrl ? (
        <img className={styles.photo} src={member.photoUrl} alt="" />
      ) : (
        <div className={styles.avatarPlaceholder} aria-hidden="true">
          {getInitials(member.name)}
        </div>
      )}
      <h3 className={styles.name}>{member.name}</h3>
      <p className={styles.role}>{member.role}</p>
      {member.socialLinks.length > 0 && (
        <div className={styles.social}>
          {member.socialLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${member.name} no ${link.platform === 'instagram' ? 'Instagram' : 'LinkedIn'}`}
            >
              {link.platform === 'instagram' ? <InstagramIcon /> : <LinkedInIcon />}
            </a>
          ))}
        </div>
      )}
    </Card>
  )
}
