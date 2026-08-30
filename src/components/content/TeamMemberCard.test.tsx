import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TeamMemberCard } from './TeamMemberCard'
import type { TeamMember } from '../../types/entities'

describe('TeamMemberCard', () => {
  it('shows the photo when photoUrl is present', () => {
    const { container } = render(
      <TeamMemberCard
        member={{
          id: 'm1',
          name: 'Mariana Costa',
          role: 'Vice-Presidente',
          area: 'Diretoria Executiva',
          photoUrl: 'https://example.com/mariana.jpg',
          socialLinks: [],
        }}
      />,
    )

    // alt="" is deliberate (decorative — the name is already announced as text right next to
    // it), so the image is intentionally absent from the accessibility tree.
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', 'https://example.com/mariana.jpg')
  })

  it('shows an initials placeholder when photoUrl is absent', () => {
    const member: TeamMember = {
      id: 'm2',
      name: 'Carla Menezes',
      role: 'Membra de Pesquisa',
      area: 'Pesquisa',
      socialLinks: [],
    }
    render(<TeamMemberCard member={member} />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('CM')).toBeInTheDocument()
  })

  it('renders a link for each social platform', () => {
    render(
      <TeamMemberCard
        member={{
          id: 'm3',
          name: 'Júlia Ferreira',
          role: 'Diretora de Marketing',
          area: 'Marketing',
          socialLinks: [
            { platform: 'instagram', url: 'https://instagram.com/liac.ufrj' },
            { platform: 'linkedin', url: 'https://linkedin.com/company/liac-ufrj' },
          ],
        }}
      />,
    )

    expect(screen.getByRole('link', { name: /instagram/i })).toHaveAttribute(
      'href',
      'https://instagram.com/liac.ufrj',
    )
    expect(screen.getByRole('link', { name: /linkedin/i })).toHaveAttribute(
      'href',
      'https://linkedin.com/company/liac-ufrj',
    )
  })
})
