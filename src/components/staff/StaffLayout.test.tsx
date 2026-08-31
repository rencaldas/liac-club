import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StaffLayout } from './StaffLayout'
import { AuthProvider } from '../../auth/AuthContext'

vi.mock('../../services/client', () => ({
  apiClient: {
    logout: vi.fn(),
  },
}))

const STORAGE_KEY = 'liac_staff_session'

function renderLayout() {
  const router = createMemoryRouter(
    [{ path: '/portal-liac/novidades', element: <StaffLayout />, children: [{ index: true, element: <p>conteúdo</p> }] }],
    { initialEntries: ['/portal-liac/novidades'] },
  )
  return render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  )
}

describe('StaffLayout', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows a profile-photo button linking to the edit-profile route, with initials when there is no photo', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: 'tok-1', role: 'coordenador', displayName: 'Fulana' }))
    renderLayout()

    const link = screen.getByRole('link', { name: 'Editar perfil' })
    expect(link).toHaveAttribute('href', '/portal-liac/perfil')
    expect(link).toHaveTextContent('F')
  })

  it('renders the collaborator photo inside the profile button when one is set', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: 'tok-1', role: 'coordenador', displayName: 'Fulana', photoUrl: 'https://x/foto.jpg' }),
    )
    renderLayout()

    const link = screen.getByRole('link', { name: 'Editar perfil' })
    expect(link.querySelector('img')).toHaveAttribute('src', 'https://x/foto.jpg')
  })
})
