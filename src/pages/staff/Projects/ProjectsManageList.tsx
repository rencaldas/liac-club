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
import type { ResearchProject } from '../../../types/entities'
import styles from '../ManageList.module.css'

const STATUS_LABELS: Record<ResearchProject['status'], string> = {
  ativo: 'Ativo',
  concluído: 'Concluído',
}

export function ProjectsManageList() {
  const { session } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [pendingDelete, setPendingDelete] = useState<ResearchProject | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const fetchProjects = useCallback(() => apiClient.getProjects({ pageSize: 100 }), [])
  const { status, data } = useAsyncResource(fetchProjects, [refreshKey])

  async function handleConfirmDelete() {
    if (!pendingDelete || !session) return
    setDeleteError(null)
    try {
      await apiClient.deleteProject(pendingDelete.id, session.token)
      setPendingDelete(null)
      setRefreshKey((key) => key + 1)
    } catch {
      setDeleteError('Não foi possível excluir. Tente novamente.')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Projetos</h1>
        <Link to="/portal-equipe/projetos/novo" className={styles.newButton}>
          <PlusIcon width={16} height={16} />
          Novo Projeto
        </Link>
      </div>

      {status === 'loading' && <LoadingState label="Carregando projetos…" />}
      {status === 'error' && <EmptyState title="Não foi possível carregar os projetos." />}
      {status === 'empty' && (
        <EmptyState title="Nenhum projeto cadastrado" description="Cadastre o primeiro projeto de pesquisa da liga." />
      )}

      {status === 'success' && data && (
        <DataTable
          items={data.items}
          getKey={(item) => item.id}
          columns={[
            { header: 'Título', render: (item) => item.title },
            { header: 'Status', render: (item) => STATUS_LABELS[item.status] },
            { header: 'Integrantes', render: (item) => item.members.join(', ') },
          ]}
          renderActions={(item) => (
            <>
              <Link to={`/portal-equipe/projetos/${item.id}/editar`}>Editar</Link>
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
          title="Excluir projeto"
          message={`Tem certeza que deseja excluir "${pendingDelete.title}"? Essa ação não pode ser desfeita.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
