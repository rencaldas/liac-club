import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'
import { apiClient } from '../services/client'
import type { AuthSession } from '../types/entities'

vi.mock('../services/client', () => ({
  apiClient: {
    login: vi.fn(),
    logout: vi.fn(),
  },
}))

const login = vi.mocked(apiClient.login)
const logout = vi.mocked(apiClient.logout)

const SESSION: AuthSession = { token: 'tok-1', role: 'coordenador', displayName: 'Fulana' }
const STORAGE_KEY = 'liac_staff_session'

function Probe() {
  const { session, login: doLogin, logout: doLogout } = useAuth()
  return (
    <div>
      <p>{session ? `logged in as ${session.displayName}` : 'logged out'}</p>
      <button onClick={() => doLogin({ email: 'a@b.com', password: 'x' })}>login</button>
      <button onClick={() => doLogout()}>logout</button>
    </div>
  )
}

function renderProbe() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    login.mockReset()
    logout.mockReset()
    localStorage.clear()
  })

  it('starts logged out when nothing is in localStorage', () => {
    renderProbe()
    expect(screen.getByText('logged out')).toBeInTheDocument()
  })

  it('restores a previously stored session on mount', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SESSION))
    renderProbe()
    expect(screen.getByText('logged in as Fulana')).toBeInTheDocument()
  })

  it('login() stores the session in state and localStorage', async () => {
    login.mockResolvedValue(SESSION)
    const user = userEvent.setup()
    renderProbe()

    await user.click(screen.getByText('login'))

    await waitFor(() => expect(screen.getByText('logged in as Fulana')).toBeInTheDocument())
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(SESSION)
  })

  it('logout() clears state and localStorage, even if the server call fails', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SESSION))
    logout.mockRejectedValue(new Error('network down'))
    const user = userEvent.setup()
    renderProbe()
    expect(screen.getByText('logged in as Fulana')).toBeInTheDocument()

    await act(async () => {
      await user.click(screen.getByText('logout'))
    })

    expect(screen.getByText('logged out')).toBeInTheDocument()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
