import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { RequireAuth } from './RequireAuth'
import { AuthProvider } from './AuthContext'
import type { AuthSession } from '../types/entities'

const STORAGE_KEY = 'liac_staff_session'
const SESSION: AuthSession = { token: 'tok-1', role: 'coordenador', displayName: 'Fulana' }

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/portal-equipe/login" element={<p>Tela de login</p>} />
          <Route element={<RequireAuth />}>
            <Route path="/portal-equipe/novidades" element={<p>Área protegida</p>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('RequireAuth', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirects to the login route when there is no session', () => {
    renderAt('/portal-equipe/novidades')
    expect(screen.getByText('Tela de login')).toBeInTheDocument()
    expect(screen.queryByText('Área protegida')).not.toBeInTheDocument()
  })

  it('renders the protected route when a valid session exists', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SESSION))
    renderAt('/portal-equipe/novidades')
    expect(screen.getByText('Área protegida')).toBeInTheDocument()
  })
})
