import type { SocialPlatform, TeamMember } from '../../types/entities'
import { Card } from '../ui/Card'
import { GitHubIcon } from '../ui/icons/GitHubIcon'
import { InstagramIcon } from '../ui/icons/InstagramIcon'
import { LinkedInIcon } from '../ui/icons/LinkedInIcon'
import styles from './TeamMemberCard.module.css'

const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  github: 'GitHub',
}

const SOCIAL_ICONS: Record<SocialPlatform, typeof InstagramIcon> = {
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
  github: GitHubIcon,
}

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
          {member.socialLinks.map((link) => {
            const Icon = SOCIAL_ICONS[link.platform]
            return (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} no ${SOCIAL_LABELS[link.platform]}`}
              >
                <Icon />
              </a>
            )
          })}
        </div>
      )}
    </Card>
  )
}
