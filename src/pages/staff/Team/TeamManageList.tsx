import { useCallback, useState, type FormEvent } from 'react'
import { apiClient } from '../../../services/client'
import { useAuth } from '../../../auth/AuthContext'
import { ALL_ROLES, ROLE_LABELS } from '../../../auth/roles'
import { useAsyncResource } from '../../../hooks/useAsyncResource'
import { LoadingState } from '../../../components/ui/LoadingState'
import { EmptyState } from '../../../components/ui/EmptyState'
import { DataTable } from '../../../components/staff/DataTable'
import { ConfirmDialog } from '../../../components/staff/ConfirmDialog'
import type { StaffMember, StaffRole } from '../../../types/entities'
import listStyles from '../ManageList.module.css'
import styles from './TeamManageList.module.css'

const EMPTY_INVITE = { email: '', displayName: '', role: 'coordenador' as StaffRole }

export function TeamManageList() {
  const { session } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [invite, setInvite] = useState(EMPTY_INVITE)
  const [isInviting, setIsInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)
  const [pendingRevoke, setPendingRevoke] = useState<StaffMember | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const fetchStaff = useCallback(() => {
    if (!session) return Promise.resolve([] as StaffMember[])
    return apiClient.getStaffMembers(session.token)
  }, [session])
  const { status, data } = useAsyncResource(fetchStaff, [refreshKey, session])

  async function handleInvite(event: FormEvent) {
    event.preventDefault()
    if (!session) return
    setInviteError(null)
    setInviteSuccess(null)
    setIsInviting(true)
    try {
      await apiClient.inviteCollaborator(
        {
          email: invite.email,
          displayName: invite.displayName,
          role: invite.role,
          redirectTo: `${window.location.origin}/definir-senha`,
        },
        session.token,
      )
      setInviteSuccess(`Convite enviado para ${invite.email}.`)
      setInvite(EMPTY_INVITE)
      setRefreshKey((key) => key + 1)
    } catch {
      setInviteError('Não foi possível enviar o convite. Confirme se o e-mail já não está cadastrado.')
    } finally {
      setIsInviting(false)
    }
  }

  async function handleRoleChange(member: StaffMember, role: StaffRole) {
    if (!session) return
    setActionError(null)
    try {
      await apiClient.updateStaffRole(member.id, role, session.token)
      setRefreshKey((key) => key + 1)
    } catch {
      setActionError('Não foi possível trocar o cargo. Tente novamente.')
    }
  }

  async function handleConfirmRevoke() {
    if (!pendingRevoke || !session) return
    setActionError(null)
    try {
      await apiClient.revokeStaffAccess(pendingRevoke.id, session.token)
      setPendingRevoke(null)
      setRefreshKey((key) => key + 1)
    } catch {
      setActionError('Não foi possível revogar o acesso. Tente novamente.')
    }
  }

  return (
    <div className={listStyles.page}>
      <div className={listStyles.header}>
        <h1>Equipe</h1>
      </div>

      <form className={styles.inviteForm} onSubmit={handleInvite}>
        <h2>Convidar colaborador</h2>
        <div className={styles.inviteFields}>
          <div className={styles.field}>
            <label htmlFor="invite-email">E-mail</label>
            <input
              id="invite-email"
              type="email"
              required
              value={invite.email}
              onChange={(event) => setInvite((prev) => ({ ...prev, email: event.target.value }))}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="invite-name">Nome</label>
            <input
              id="invite-name"
              required
              value={invite.displayName}
              onChange={(event) => setInvite((prev) => ({ ...prev, displayName: event.target.value }))}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="invite-role">Cargo</label>
            <select
              id="invite-role"
              value={invite.role}
              onChange={(event) => setInvite((prev) => ({ ...prev, role: event.target.value as StaffRole }))}
            >
              {ALL_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className={styles.inviteButton} disabled={isInviting}>
            {isInviting ? 'Convidando…' : 'Convidar'}
          </button>
        </div>
        {inviteError && (
          <p className={styles.errorText} role="alert">
            {inviteError}
          </p>
        )}
        {inviteSuccess && (
          <p className={styles.successText} role="status">
            {inviteSuccess}
          </p>
        )}
      </form>

      {status === 'loading' && <LoadingState label="Carregando equipe…" />}
      {status === 'error' && <EmptyState title="Não foi possível carregar a equipe." />}
      {status === 'empty' && <EmptyState title="Nenhum colaborador cadastrado ainda." />}

      {status === 'success' && data && (
        <DataTable
          items={data}
          getKey={(member) => member.id}
          columns={[
            { header: 'Nome', render: (member) => member.displayName },
            { header: 'E-mail', render: (member) => member.email },
            {
              header: 'Cargo',
              render: (member) => (
                <select
                  value={member.role}
                  onChange={(event) => handleRoleChange(member, event.target.value as StaffRole)}
                  aria-label={`Cargo de ${member.displayName}`}
                >
                  {ALL_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              ),
            },
          ]}
          renderActions={(member) => (
            <button type="button" onClick={() => setPendingRevoke(member)}>
              Revogar
            </button>
          )}
        />
      )}

      {actionError && (
        <p className={listStyles.deleteError} role="alert">
          {actionError}
        </p>
      )}

      {pendingRevoke && (
        <ConfirmDialog
          title="Revogar acesso"
          message={`Tem certeza que deseja revogar o acesso de "${pendingRevoke.displayName}"? Essa ação não pode ser desfeita.`}
          confirmLabel="Revogar"
          onConfirm={handleConfirmRevoke}
          onCancel={() => setPendingRevoke(null)}
        />
      )}
    </div>
  )
}
