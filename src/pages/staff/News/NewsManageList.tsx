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
import { formatDateShort } from '../../../utils/date'
import type { NewsItem } from '../../../types/entities'
import styles from '../ManageList.module.css'

export function NewsManageList() {
  const { session } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [pendingDelete, setPendingDelete] = useState<NewsItem | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const fetchNews = useCallback(() => apiClient.getNews({ pageSize: 100 }), [])
  const { status, data } = useAsyncResource(fetchNews, [refreshKey])

  async function handleConfirmDelete() {
    if (!pendingDelete || !session) return
    setDeleteError(null)
    try {
      await apiClient.deleteNews(pendingDelete.slug, session.token)
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
        <h1>Novidades</h1>
        <Link to="/portal-equipe/novidades/novo" className={styles.newButton}>
          <PlusIcon width={16} height={16} />
          Nova Novidade
        </Link>
      </div>

      {status === 'loading' && <LoadingState label="Carregando novidades…" />}
      {status === 'error' && <EmptyState title="Não foi possível carregar as novidades." />}
      {status === 'empty' && (
        <EmptyState title="Nenhuma novidade cadastrada" description="Crie a primeira novidade da liga." />
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
            { header: 'Categoria', render: (item) => item.category },
            { header: 'Publicado em', render: (item) => formatDateShort(item.publishedAt) },
            { header: 'Destaque', render: (item) => (item.featured ? 'Sim' : 'Não') },
          ]}
          renderActions={(item) => (
            <>
              <Link to={`/portal-equipe/novidades/${item.slug}/editar`}>Editar</Link>
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
          title="Excluir novidade"
          message={`Tem certeza que deseja excluir "${pendingDelete.title}"? Essa ação não pode ser desfeita.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
