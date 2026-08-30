import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginForm } from './LoginForm'
import { AuthProvider } from '../../auth/AuthContext'
import { apiClient } from '../../services/client'

vi.mock('../../services/client', () => ({
  apiClient: {
    login: vi.fn(),
  },
}))

const login = vi.mocked(apiClient.login)

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/portal-liac/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/portal-liac/login" element={<LoginForm />} />
          <Route path="/portal-liac/novidades" element={<p>Painel de novidades</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('LoginForm', () => {
  beforeEach(() => {
    login.mockReset()
    localStorage.clear()
  })

  it('shows a generic error on invalid credentials, without revealing which field was wrong', async () => {
    login.mockRejectedValue(new Error('INVALID_CREDENTIALS'))
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('E-mail'), 'errada@liac.club')
    await user.type(screen.getByLabelText('Senha'), 'errada')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('E-mail ou senha inválidos.')
    })
  })

  it('redirects to the staff panel on successful login', async () => {
    login.mockResolvedValue({ token: 'tok-1', role: 'coordenador', displayName: 'Fulana' })
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('E-mail'), 'equipe.demo@liac.club')
    await user.type(screen.getByLabelText('Senha'), 'LiacDemo!Member2026')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Painel de novidades')).toBeInTheDocument()
    })
  })
})
