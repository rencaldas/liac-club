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
import { formatEventDateRangeShort } from '../../../utils/date'
import type { SymposiumEdition } from '../../../types/entities'
import styles from '../ManageList.module.css'

export function SymposiumEditionsManageList() {
  const { session } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [pendingDelete, setPendingDelete] = useState<SymposiumEdition | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const fetchEditions = useCallback(() => apiClient.getSymposiumEditions({ pageSize: 100 }), [])
  const { status, data } = useAsyncResource(fetchEditions, [refreshKey])

  async function handleConfirmDelete() {
    if (!pendingDelete || !session) return
    setDeleteError(null)
    try {
      await apiClient.deleteSymposiumEdition(pendingDelete.slug, session.token)
      setPendingDelete(null)
      setRefreshKey((key) => key + 1)
    } catch {
      setDeleteError('Não foi possível excluir. Tente novamente.')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Edições Anteriores do Simpósio</h1>
        <Link to="/portal-liac/edicoes-anteriores/novo" className={styles.newButton}>
          <PlusIcon width={16} height={16} />
          Nova Edição
        </Link>
      </div>

      {status === 'loading' && <LoadingState label="Carregando edições…" />}
      {status === 'error' && <EmptyState title="Não foi possível carregar as edições." />}
      {status === 'empty' && (
        <EmptyState title="Nenhuma edição cadastrada" description="Registre a primeira edição do Simpósio LIAC." />
      )}

      {status === 'success' && data && (
        <DataTable
          items={data.items}
          getKey={(item) => item.slug}
          columns={[
            { header: 'Título', render: (item) => item.title },
            { header: 'Ano', render: (item) => item.year },
            { header: 'Data', render: (item) => formatEventDateRangeShort(item.startDate, item.endDate) },
            { header: 'Local', render: (item) => item.location },
            { header: 'Destaque', render: (item) => (item.featured ? 'Sim' : 'Não') },
          ]}
          renderActions={(item) => (
            <>
              <Link to={`/portal-liac/edicoes-anteriores/${item.slug}/editar`}>Editar</Link>
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
          title="Excluir edição"
          message={`Tem certeza que deseja excluir "${pendingDelete.title}"? Essa ação não pode ser desfeita.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
