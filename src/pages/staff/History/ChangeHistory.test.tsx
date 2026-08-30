import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChangeHistory } from './ChangeHistory'
import { AuthProvider } from '../../../auth/AuthContext'
import { apiClient } from '../../../services/client'
import type { AuditLogEntry } from '../../../types/entities'

vi.mock('../../../services/client', () => ({
  apiClient: {
    getAuditLog: vi.fn(),
  },
}))

const getAuditLog = vi.mocked(apiClient.getAuditLog)

const STORAGE_KEY = 'liac_staff_session'

function makeEntry(overrides: Partial<AuditLogEntry> = {}): AuditLogEntry {
  return {
    id: 'entry-1',
    author: 'Diretora',
    timestamp: '2026-08-30T12:00:00Z',
    action: 'create',
    entityType: 'news',
    entityLabel: 'Novidade X',
    ...overrides,
  }
}

function renderPage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: 'tok-1', role: 'diretor_marketing', displayName: 'Diretora' }))
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ChangeHistory />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('ChangeHistory', () => {
  beforeEach(() => {
    getAuditLog.mockReset()
    localStorage.clear()
  })

  it('lists audit entries most-recent-first as returned by the API', async () => {
    getAuditLog.mockResolvedValue({
      items: [makeEntry({ entityLabel: 'Novidade Criada' })],
      page: 1,
      pageSize: 20,
      total: 1,
    })
    renderPage()

    await waitFor(() => expect(screen.getByText('Novidade Criada')).toBeInTheDocument())
    expect(getAuditLog).toHaveBeenCalledWith({ author: undefined, pageSize: 50 }, 'tok-1')
  })

  it('refetches with the typed author once the filter is submitted', async () => {
    getAuditLog.mockResolvedValue({ items: [], page: 1, pageSize: 20, total: 0 })
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(getAuditLog).toHaveBeenCalled())

    await user.type(screen.getByLabelText('Filtrar por autor'), 'Fulana')
    await user.click(screen.getByRole('button', { name: 'Filtrar' }))

    await waitFor(() => {
      expect(getAuditLog).toHaveBeenLastCalledWith({ author: 'Fulana', pageSize: 50 }, 'tok-1')
    })
  })
})
