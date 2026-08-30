import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PartnerLogo } from './PartnerLogo'
import type { Partner } from '../../types/entities'

describe('PartnerLogo', () => {
  it('opens the external URL in a new tab with rel=noopener noreferrer', () => {
    const partner: Partner = {
      id: 'p1',
      name: 'Parceiro Exemplo',
      logoUrl: '',
      externalUrl: 'https://example.com/parceiro',
    }
    render(<PartnerLogo partner={partner} />)

    const link = screen.getByRole('link', { name: /parceiro exemplo/i })
    expect(link).toHaveAttribute('href', 'https://example.com/parceiro')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('shows the partner name as a placeholder when logoUrl is absent', () => {
    render(
      <PartnerLogo
        partner={{
          id: 'p2',
          name: 'Parceiro Sem Logo',
          logoUrl: '',
          externalUrl: 'https://example.com',
        }}
      />,
    )

    expect(screen.getByText('Parceiro Sem Logo')).toBeInTheDocument()
  })

  it('shows the logo image when logoUrl is present', () => {
    render(
      <PartnerLogo
        partner={{
          id: 'p3',
          name: 'Parceiro Com Logo',
          logoUrl: 'https://example.com/logo.png',
          externalUrl: 'https://example.com',
        }}
      />,
    )

    expect(screen.getByRole('img', { name: 'Parceiro Com Logo' })).toHaveAttribute(
      'src',
      'https://example.com/logo.png',
    )
  })
})
