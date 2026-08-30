import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '../../../services/client'
import { useAuth } from '../../../auth/AuthContext'
import { useAsyncResource } from '../../../hooks/useAsyncResource'
import { LoadingState } from '../../../components/ui/LoadingState'
import { EmptyState } from '../../../components/ui/EmptyState'
import { DataTable } from '../../../components/staff/DataTable'
import { ConfirmDialog } from '../../../components/staff/ConfirmDialog'
import { formatAuthors } from '../../../utils/text'
import type { ScientificArticle } from '../../../types/entities'
import styles from '../ManageList.module.css'

export function ArticlesManageList() {
  const { session } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [pendingDelete, setPendingDelete] = useState<ScientificArticle | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const fetchArticles = useCallback(() => apiClient.getArticles({ pageSize: 100 }), [])
  const { status, data } = useAsyncResource(fetchArticles, [refreshKey])

  async function handleConfirmDelete() {
    if (!pendingDelete || !session) return
    setDeleteError(null)
    try {
      await apiClient.deleteArticle(pendingDelete.slug, session.token)
      setPendingDelete(null)
      setRefreshKey((key) => key + 1)
    } catch {
      setDeleteError('Não foi possível excluir. Tente novamente.')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Artigos Científicos</h1>
        <Link to="/portal-liac/artigos/novo" className={styles.newButton}>
          Novo Artigo
        </Link>
      </div>

      {status === 'loading' && <LoadingState label="Carregando artigos…" />}
      {status === 'error' && <EmptyState title="Não foi possível carregar os artigos." />}
      {status === 'empty' && (
        <EmptyState title="Nenhum artigo cadastrado" description="Publique o primeiro artigo da liga." />
      )}

      {status === 'success' && data && (
        <DataTable
          items={data.items}
          getKey={(item) => item.slug}
          columns={[
            { header: 'Título', render: (item) => item.title },
            { header: 'Autores', render: (item) => formatAuthors(item.authors) },
            { header: 'Destaque', render: (item) => (item.featured ? 'Sim' : 'Não') },
          ]}
          renderActions={(item) => (
            <>
              <Link to={`/portal-liac/artigos/${item.slug}/editar`}>Editar</Link>
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
          title="Excluir artigo"
          message={`Tem certeza que deseja excluir "${pendingDelete.title}"? Essa ação não pode ser desfeita.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
