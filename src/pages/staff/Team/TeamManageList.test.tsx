import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TeamManageList } from './TeamManageList'
import { AuthProvider } from '../../../auth/AuthContext'
import { apiClient } from '../../../services/client'
import type { StaffMember } from '../../../types/entities'

vi.mock('../../../services/client', () => ({
  apiClient: {
    getStaffMembers: vi.fn(),
    inviteCollaborator: vi.fn(),
    updateStaffRole: vi.fn(),
    revokeStaffAccess: vi.fn(),
  },
}))

const getStaffMembers = vi.mocked(apiClient.getStaffMembers)
const inviteCollaborator = vi.mocked(apiClient.inviteCollaborator)
const updateStaffRole = vi.mocked(apiClient.updateStaffRole)
const revokeStaffAccess = vi.mocked(apiClient.revokeStaffAccess)

const STORAGE_KEY = 'liac_staff_session'

function makeMember(overrides: Partial<StaffMember> = {}): StaffMember {
  return {
    id: 'member-1',
    displayName: 'Fulana de Tal',
    role: 'coordenador',
    email: 'fulana@liac.club',
    ...overrides,
  }
}

function renderPage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: 'tok-1', role: 'diretor_marketing', displayName: 'Diretora' }))
  return render(
    <MemoryRouter>
      <AuthProvider>
        <TeamManageList />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('TeamManageList', () => {
  beforeEach(() => {
    getStaffMembers.mockReset()
    inviteCollaborator.mockReset()
    updateStaffRole.mockReset()
    revokeStaffAccess.mockReset()
    localStorage.clear()
  })

  it('lists the current team', async () => {
    getStaffMembers.mockResolvedValue([makeMember({ displayName: 'Beltrana' })])
    renderPage()
    await waitFor(() => expect(screen.getByText('Beltrana')).toBeInTheDocument())
  })

  it('invites a new collaborator with the chosen role and a redirectTo pointing at /definir-senha', async () => {
    getStaffMembers.mockResolvedValue([])
    inviteCollaborator.mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('E-mail'), 'nova@liac.club')
    await user.type(screen.getByLabelText('Nome'), 'Nova Pessoa')
    await user.selectOptions(screen.getByLabelText('Cargo'), 'presidente')
    await user.click(screen.getByRole('button', { name: 'Convidar' }))

    await waitFor(() => {
      expect(inviteCollaborator).toHaveBeenCalledWith(
        {
          email: 'nova@liac.club',
          displayName: 'Nova Pessoa',
          role: 'presidente',
          redirectTo: expect.stringContaining('/definir-senha'),
        },
        'tok-1',
      )
    })
    expect(await screen.findByText('Convite enviado para nova@liac.club.')).toBeInTheDocument()
  })

  it('changes a member role via the row select', async () => {
    getStaffMembers.mockResolvedValue([makeMember()])
    updateStaffRole.mockResolvedValue(makeMember({ role: 'diretor_eventos' }))
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => expect(screen.getByLabelText('Cargo de Fulana de Tal')).toBeInTheDocument())
    await user.selectOptions(screen.getByLabelText('Cargo de Fulana de Tal'), 'diretor_eventos')

    await waitFor(() => expect(updateStaffRole).toHaveBeenCalledWith('member-1', 'diretor_eventos', 'tok-1'))
  })

  it('opens a full-size preview of a member photo and closes it', async () => {
    getStaffMembers.mockResolvedValue([
      makeMember({ photoUrl: 'https://example.com/fulana.jpg' }),
    ])
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => expect(screen.getByRole('button', { name: 'Ver foto de Fulana de Tal' })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Ver foto de Fulana de Tal' }))

    const dialog = screen.getByRole('dialog', { name: 'Foto de Fulana de Tal' })
    // alt="" is deliberate (decorative — the name is already in the caption right below it), so
    // the image is intentionally absent from the accessibility tree — query the DOM directly.
    expect(dialog.querySelector('img')).toHaveAttribute('src', 'https://example.com/fulana.jpg')

    await user.click(within(dialog).getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('revokes access only after confirming the dialog', async () => {
    getStaffMembers.mockResolvedValue([makeMember()])
    revokeStaffAccess.mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => expect(screen.getByText('Fulana de Tal')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Revogar' }))

    const dialog = screen.getByRole('alertdialog')
    expect(revokeStaffAccess).not.toHaveBeenCalled()
    await user.click(within(dialog).getByRole('button', { name: 'Revogar' }))

    await waitFor(() => expect(revokeStaffAccess).toHaveBeenCalledWith('member-1', 'tok-1'))
  })
})
