import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '../../../services/client'
import { useAuth } from '../../../auth/AuthContext'
import { useAsyncResource } from '../../../hooks/useAsyncResource'
import { LoadingState } from '../../../components/ui/LoadingState'
import { EmptyState } from '../../../components/ui/EmptyState'
import { DataTable } from '../../../components/staff/DataTable'
import { ConfirmDialog } from '../../../components/staff/ConfirmDialog'
import { PlusIcon } from '../../../components/ui/icons/StaffIcons'
import type { Partner } from '../../../types/entities'
import styles from '../ManageList.module.css'

export function PartnersManageList() {
  const { session } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [pendingDelete, setPendingDelete] = useState<Partner | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const fetchPartners = useCallback(() => apiClient.getPartners(), [])
  const { status, data } = useAsyncResource(fetchPartners, [refreshKey])

  async function handleConfirmDelete() {
    if (!pendingDelete || !session) return
    setDeleteError(null)
    try {
      await apiClient.deletePartner(pendingDelete.id, session.token)
      setPendingDelete(null)
      setRefreshKey((key) => key + 1)
    } catch {
      setDeleteError('Não foi possível excluir. Tente novamente.')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Parceiros</h1>
        <Link to="/portal-liac/parceiros/novo" className={styles.newButton}>
          <PlusIcon width={16} height={16} />
          Novo Parceiro
        </Link>
      </div>

      {status === 'loading' && <LoadingState label="Carregando parceiros…" />}
      {status === 'error' && <EmptyState title="Não foi possível carregar os parceiros." />}
      {status === 'empty' && (
        <EmptyState title="Nenhum parceiro cadastrado" description="Cadastre o primeiro parceiro da liga." />
      )}

      {status === 'success' && data && (
        <DataTable
          items={data}
          getKey={(item) => item.id}
          columns={[
            {
              header: 'Logo',
              render: (item) =>
                item.logoUrl ? (
                  <img src={item.logoUrl} alt="" className={styles.thumb} />
                ) : (
                  <span className={styles.thumbPlaceholder} aria-hidden="true">
                    —
                  </span>
                ),
            },
            { header: 'Nome', render: (item) => item.name },
            { header: 'Nível', render: (item) => item.tier ?? '—' },
          ]}
          renderActions={(item) => (
            <>
              <Link to={`/portal-liac/parceiros/${item.id}/editar`}>Editar</Link>
              <button type="button" onClick={() => setPendingDelete(item)}>
                Excluir
              </button>
            </>
          )}
        />
      )}

      {deleteError && (
        <p className={styles.deleteError} role="alert">
          {deleteError}
        </p>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Excluir parceiro"
          message={`Tem certeza que deseja excluir "${pendingDelete.name}"? Essa ação não pode ser desfeita.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
