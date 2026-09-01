import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '../../../services/client'
import { deleteImage } from '../../../services/storage'
import { useAuth } from '../../../auth/AuthContext'
import { useAsyncResource } from '../../../hooks/useAsyncResource'
import { LoadingState } from '../../../components/ui/LoadingState'
import { EmptyState } from '../../../components/ui/EmptyState'
import { DataTable } from '../../../components/staff/DataTable'
import { ConfirmDialog } from '../../../components/staff/ConfirmDialog'
import { PlusIcon, ImagePlaceholderIcon } from '../../../components/ui/icons/StaffIcons'
import { formatEventDateRangeShort } from '../../../utils/date'
import type { Event } from '../../../types/entities'
import styles from '../ManageList.module.css'

export function EventsManageList() {
  const { session } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [pendingDelete, setPendingDelete] = useState<Event | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const fetchEvents = useCallback(() => apiClient.getEvents({ pageSize: 100 }), [])
  const { status, data } = useAsyncResource(fetchEvents, [refreshKey])

  async function handleConfirmDelete() {
    if (!pendingDelete || !session) return
    setDeleteError(null)
    try {
      await apiClient.deleteEvent(pendingDelete.slug, session.token)
      if (pendingDelete.coverImageUrl) void deleteImage(pendingDelete.coverImageUrl, session.token)
      setPendingDelete(null)
      setRefreshKey((key) => key + 1)
    } catch {
      setDeleteError('Não foi possível excluir. Tente novamente.')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Eventos</h1>
        <Link to="/portal-liac/eventos/novo" className={styles.newButton}>
          <PlusIcon width={16} height={16} />
          Novo Evento
        </Link>
      </div>

      {status === 'loading' && <LoadingState label="Carregando eventos…" />}
      {status === 'error' && <EmptyState title="Não foi possível carregar os eventos." />}
      {status === 'empty' && (
        <EmptyState title="Nenhum evento cadastrado" description="Crie o primeiro evento da liga." />
      )}

      {status === 'success' && data && (
        <DataTable
          items={data.items}
          getKey={(item) => item.slug}
          columns={[
            {
              header: 'Capa',
              render: (item) =>
                item.coverImageUrl ? (
                  <img src={item.coverImageUrl} alt="" className={styles.thumb} />
                ) : (
                  <span className={styles.thumbPlaceholder}>
                    <ImagePlaceholderIcon width={16} height={16} />
                  </span>
                ),
            },
            { header: 'Título', render: (item) => item.title },
            { header: 'Data', render: (item) => formatEventDateRangeShort(item.startDate, item.endDate) },
            { header: 'Local', render: (item) => item.location },
            { header: 'Destaque', render: (item) => (item.featured ? 'Sim' : 'Não') },
          ]}
          renderActions={(item) => (
            <>
              <Link to={`/portal-liac/eventos/${item.slug}/editar`}>Editar</Link>
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
          title="Excluir evento"
          message={`Tem certeza que deseja excluir "${pendingDelete.title}"? Essa ação não pode ser desfeita.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
