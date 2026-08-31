import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Contact } from './Contact'

vi.mock('../../services/client', () => ({
  apiClient: {
    submitContactForm: vi.fn(),
  },
}))

describe('Contact', () => {
  it('shows institutional information, social links and a map placeholder', () => {
    render(<Contact />)

    expect(screen.getByText(/faculdade de farmácia/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /instagram/i })).toHaveAttribute(
      'href',
      'https://www.instagram.com/liac_ufrj?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw==',
    )
    expect(screen.getByRole('link', { name: /linkedin/i })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/company/liac-ufrj/',
    )
    expect(screen.getByText('Mapa de localização (placeholder)')).toBeInTheDocument()
  })

  it('embeds the contact form', () => {
    render(<Contact />)

    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument()
  })
})
