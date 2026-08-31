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
import type { Testimonial } from '../../../types/entities'
import styles from '../ManageList.module.css'

function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text
}

export function TestimonialsManageList() {
  const { session } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [pendingDelete, setPendingDelete] = useState<Testimonial | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const fetchTestimonials = useCallback(() => apiClient.getTestimonials(), [])
  const { status, data } = useAsyncResource(fetchTestimonials, [refreshKey])

  async function handleConfirmDelete() {
    if (!pendingDelete || !session) return
    setDeleteError(null)
    try {
      await apiClient.deleteTestimonial(pendingDelete.id, session.token)
      setPendingDelete(null)
      setRefreshKey((key) => key + 1)
    } catch {
      setDeleteError('Não foi possível excluir. Tente novamente.')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Depoimentos</h1>
        <Link to="/portal-liac/depoimentos/novo" className={styles.newButton}>
          <PlusIcon width={16} height={16} />
          Novo Depoimento
        </Link>
      </div>

      {status === 'loading' && <LoadingState label="Carregando depoimentos…" />}
      {status === 'error' && <EmptyState title="Não foi possível carregar os depoimentos." />}
      {status === 'empty' && (
        <EmptyState
          title="Nenhum depoimento cadastrado"
          description="Cadastre o primeiro depoimento de um ligante."
        />
      )}

      {status === 'success' && data && (
        <DataTable
          items={data}
          getKey={(item) => item.id}
          columns={[
            { header: 'Ligante', render: (item) => item.name },
            { header: 'Depoimento', render: (item) => truncate(item.text, 80) },
          ]}
          renderActions={(item) => (
            <>
              <Link to={`/portal-liac/depoimentos/${item.id}/editar`}>Editar</Link>
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
          title="Excluir depoimento"
          message={`Tem certeza que deseja excluir o depoimento de "${pendingDelete.name}"? Essa ação não pode ser desfeita.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
