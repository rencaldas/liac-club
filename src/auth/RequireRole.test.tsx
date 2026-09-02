import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { RequireRole } from './RequireRole'
import { AuthProvider } from './AuthContext'
import type { AuthSession } from '../types/entities'

const STORAGE_KEY = 'liac_staff_session'

function sessionWith(role: AuthSession['role']): AuthSession {
  return { token: 'tok-1', role, displayName: 'Fulana' }
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/portal-equipe/novidades" element={<p>Lista de novidades</p>} />
          <Route element={<RequireRole />}>
            <Route path="/portal-equipe/historico" element={<p>Histórico</p>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('RequireRole', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirects a non-audit role (coordenador) away from the protected route', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionWith('coordenador')))
    renderAt('/portal-equipe/historico')
    expect(screen.getByText('Lista de novidades')).toBeInTheDocument()
    expect(screen.queryByText('Histórico')).not.toBeInTheDocument()
  })

  it('redirects diretor_eventos (the other non-audit role) away too', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionWith('diretor_eventos')))
    renderAt('/portal-equipe/historico')
    expect(screen.getByText('Lista de novidades')).toBeInTheDocument()
  })

  it('renders the protected route for an audit role (diretor_marketing)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionWith('diretor_marketing')))
    renderAt('/portal-equipe/historico')
    expect(screen.getByText('Histórico')).toBeInTheDocument()
  })

  it('renders it for the other 2 audit roles too (presidente, vice_presidente)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionWith('presidente')))
    const { unmount } = renderAt('/portal-equipe/historico')
    expect(screen.getByText('Histórico')).toBeInTheDocument()
    unmount()

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionWith('vice_presidente')))
    renderAt('/portal-equipe/historico')
    expect(screen.getByText('Histórico')).toBeInTheDocument()
  })
})
