import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider, useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProfileForm } from './ProfileForm'
import { AuthProvider } from '../../../auth/AuthContext'
import { apiClient } from '../../../services/client'

vi.mock('../../../services/client', () => ({
  apiClient: {
    updateOwnProfile: vi.fn(),
  },
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: vi.fn() }
})

const updateOwnProfile = vi.mocked(apiClient.updateOwnProfile)
const navigateMock = vi.fn()
vi.mocked(useNavigate).mockReturnValue(navigateMock)

const STORAGE_KEY = 'liac_staff_session'

function renderPage() {
  const router = createMemoryRouter([{ path: '/portal-liac/perfil', element: <ProfileForm /> }], {
    initialEntries: ['/portal-liac/perfil'],
  })
  return render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  )
}

describe('ProfileForm', () => {
  beforeEach(() => {
    updateOwnProfile.mockReset()
    navigateMock.mockReset()
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: 'tok-1', role: 'coordenador', displayName: 'Fulana', email: 'fulana@liac.club' }),
    )
  })

  it('shows the role as a fixed, disabled field', () => {
    renderPage()
    expect(screen.getByLabelText('Cargo')).toBeDisabled()
    expect(screen.getByLabelText('Cargo')).toHaveValue('Coordenador')
  })

  it('hides the GitHub field for roles other than desenvolvedor', () => {
    renderPage()
    expect(screen.queryByLabelText('GitHub')).not.toBeInTheDocument()
  })

  it('shows and saves a GitHub link for a desenvolvedor', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: 'tok-1', role: 'desenvolvedor', displayName: 'Dev', email: 'dev@liac.club' }),
    )
    updateOwnProfile.mockResolvedValue({
      token: 'tok-1',
      role: 'desenvolvedor',
      displayName: 'Dev',
      email: 'dev@liac.club',
    })
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('GitHub'), 'https://github.com/dev')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(updateOwnProfile).toHaveBeenCalledWith(
        {
          displayName: 'Dev',
          email: 'dev@liac.club',
          photoUrl: undefined,
          area: undefined,
          socialLinks: [{ platform: 'github', url: 'https://github.com/dev' }],
        },
        'tok-1',
      )
    })
  })

  it('saves the edited name/email/socials without sending role', async () => {
    updateOwnProfile.mockResolvedValue({
      token: 'tok-1',
      role: 'coordenador',
      displayName: 'Fulana Nova',
      email: 'nova@liac.club',
    })
    const user = userEvent.setup()
    renderPage()

    await user.clear(screen.getByLabelText('Nome'))
    await user.type(screen.getByLabelText('Nome'), 'Fulana Nova')
    await user.clear(screen.getByLabelText('E-mail'))
    await user.type(screen.getByLabelText('E-mail'), 'nova@liac.club')
    await user.type(screen.getByLabelText('Instagram'), 'https://instagram.com/fulana')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(updateOwnProfile).toHaveBeenCalledWith(
        {
          displayName: 'Fulana Nova',
          email: 'nova@liac.club',
          photoUrl: undefined,
          area: undefined,
          socialLinks: [{ platform: 'instagram', url: 'https://instagram.com/fulana' }],
        },
        'tok-1',
      )
    })
    expect(await screen.findByText('Perfil atualizado com sucesso.')).toBeInTheDocument()
  })
})
