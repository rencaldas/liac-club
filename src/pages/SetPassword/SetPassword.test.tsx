import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SetPassword } from './SetPassword'
import { AuthProvider } from '../../auth/AuthContext'
import { apiClient } from '../../services/client'

vi.mock('../../services/client', () => ({
  apiClient: {
    setPassword: vi.fn(),
  },
}))

const setPassword = vi.mocked(apiClient.setPassword)
const STORAGE_KEY = 'liac_staff_session'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/definir-senha']}>
      <AuthProvider>
        <Routes>
          <Route path="/definir-senha" element={<SetPassword />} />
          <Route path="/portal-equipe/novidades" element={<p>Painel de novidades</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('SetPassword', () => {
  beforeEach(() => {
    setPassword.mockReset()
    localStorage.clear()
    window.location.hash = ''
  })

  afterEach(() => {
    window.location.hash = ''
  })

  it('shows an error and no form when the URL has no access_token', () => {
    renderPage()
    expect(screen.getByRole('alert')).toHaveTextContent('Link de convite inválido ou expirado')
    expect(screen.queryByLabelText('Nova senha')).not.toBeInTheDocument()
  })

  it('rejects mismatched passwords without calling the API', async () => {
    window.location.hash = '#access_token=tok-invite&type=invite'
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Nova senha'), 'password123')
    await user.type(screen.getByLabelText('Confirmar senha'), 'different123')
    await user.click(screen.getByRole('button', { name: 'Salvar e entrar' }))

    expect(await screen.findByText('As senhas não coincidem.')).toBeInTheDocument()
    expect(setPassword).not.toHaveBeenCalled()
  })

  it('submits the token from the hash, stores the returned session, and logs straight in', async () => {
    window.location.hash = '#access_token=tok-invite&type=invite'
    setPassword.mockResolvedValue({ token: 'tok-invite', role: 'coordenador', displayName: 'Nova Pessoa' })
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Nova senha'), 'password123')
    await user.type(screen.getByLabelText('Confirmar senha'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Salvar e entrar' }))

    await waitFor(() => expect(setPassword).toHaveBeenCalledWith('tok-invite', 'password123'))
    expect(await screen.findByText('Painel de novidades')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
      token: 'tok-invite',
      role: 'coordenador',
      displayName: 'Nova Pessoa',
    })
  })
})
