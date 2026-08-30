import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ContactForm } from './ContactForm'
import { apiClient } from '../../services/client'

vi.mock('../../services/client', () => ({
  apiClient: {
    submitContactForm: vi.fn(),
  },
}))

const submitContactForm = vi.mocked(apiClient.submitContactForm)

describe('ContactForm', () => {
  beforeEach(() => {
    submitContactForm.mockReset()
    submitContactForm.mockResolvedValue({ status: 'received' })
  })

  it('shows validation errors per field and does not submit when required fields are empty', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(await screen.findByText('Informe seu nome.')).toBeInTheDocument()
    expect(screen.getByText('Informe seu e-mail.')).toBeInTheDocument()
    expect(screen.getByText('Informe seu telefone.')).toBeInTheDocument()
    expect(screen.getByText('Informe o melhor horário para contato.')).toBeInTheDocument()
    expect(screen.getByText('Conte-nos sobre sua necessidade.')).toBeInTheDocument()
    expect(submitContactForm).not.toHaveBeenCalled()
  })

  it('rejects an invalid e-mail and an invalid phone without submitting', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByLabelText('E-mail'), 'nao-e-um-email')
    await user.type(screen.getByLabelText('Telefone'), '123')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(await screen.findByText('Informe um e-mail válido.')).toBeInTheDocument()
    expect(screen.getByText('Informe um telefone válido, com DDD.')).toBeInTheDocument()
    expect(submitContactForm).not.toHaveBeenCalled()
  })

  it('submits and shows the 36h confirmation message when all fields are valid', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByLabelText('Nome'), 'Visitante Teste')
    await user.type(screen.getByLabelText('E-mail'), 'visitante@example.com')
    await user.type(screen.getByLabelText('Telefone'), '(21) 91234-5678')
    await user.type(screen.getByLabelText('Melhor horário para contato'), 'Manhã')
    await user.type(
      screen.getByLabelText('Conte-nos sobre sua necessidade'),
      'Gostaria de saber mais sobre a liga.',
    )
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    await waitFor(() => {
      expect(submitContactForm).toHaveBeenCalledWith({
        name: 'Visitante Teste',
        email: 'visitante@example.com',
        phone: '(21) 91234-5678',
        preferredContactTime: 'Manhã',
        message: 'Gostaria de saber mais sobre a liga.',
      })
    })
    expect(
      await screen.findByText(/entrará em contato em até 36h/i),
    ).toBeInTheDocument()
  })
})
