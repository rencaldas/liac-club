import { useCallback, useState, type FormEvent } from 'react'
import { apiClient } from '../../../services/client'
import { useAuth } from '../../../auth/AuthContext'
import { useAsyncResource } from '../../../hooks/useAsyncResource'
import { LoadingState } from '../../../components/ui/LoadingState'
import { EmptyState } from '../../../components/ui/EmptyState'
import { DataTable } from '../../../components/staff/DataTable'
import type { PaginatedResult } from '../../../services/ApiClient'
import type { AuditLogEntry } from '../../../types/entities'
import listStyles from '../ManageList.module.css'
import styles from './ChangeHistory.module.css'

const ACTION_LABELS: Record<AuditLogEntry['action'], string> = {
  create: 'Criou',
  update: 'Editou',
  delete: 'Excluiu',
  feature: 'Destacou',
  unfeature: 'Removeu destaque',
}

const ENTITY_LABELS: Record<AuditLogEntry['entityType'], string> = {
  news: 'Novidade',
  event: 'Evento',
  article: 'Artigo',
}

function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
}

export function ChangeHistory() {
  const { session } = useAuth()
  const [authorFilter, setAuthorFilter] = useState('')
  const [appliedAuthor, setAppliedAuthor] = useState('')

  const fetchLog = useCallback((): Promise<PaginatedResult<AuditLogEntry>> => {
    if (!session) return Promise.resolve({ items: [], page: 1, pageSize: 20, total: 0 })
    return apiClient.getAuditLog({ author: appliedAuthor || undefined, pageSize: 50 }, session.token)
  }, [session, appliedAuthor])
  const { status, data } = useAsyncResource(fetchLog, [appliedAuthor, session])

  function handleFilterSubmit(event: FormEvent) {
    event.preventDefault()
    setAppliedAuthor(authorFilter.trim())
  }

  return (
    <div className={listStyles.page}>
      <div className={listStyles.header}>
        <h1>Histórico de Alterações</h1>
      </div>

      <form className={styles.filterForm} onSubmit={handleFilterSubmit}>
        <label htmlFor="history-author">Filtrar por autor</label>
        <input
          id="history-author"
          value={authorFilter}
          onChange={(event) => setAuthorFilter(event.target.value)}
          placeholder="Nome de quem fez a alteração"
        />
        <button type="submit">Filtrar</button>
      </form>

      {status === 'loading' && <LoadingState label="Carregando histórico…" />}
      {status === 'error' && <EmptyState title="Não foi possível carregar o histórico." />}
      {status === 'empty' && <EmptyState title="Nenhuma alteração registrada ainda." />}

      {status === 'success' && data && (
        <DataTable
          items={data.items}
          getKey={(entry) => entry.id}
          columns={[
            { header: 'Autor', render: (entry) => entry.author },
            { header: 'Ação', render: (entry) => ACTION_LABELS[entry.action] },
            { header: 'Tipo', render: (entry) => ENTITY_LABELS[entry.entityType] },
            { header: 'Item', render: (entry) => entry.entityLabel },
            { header: 'Quando', render: (entry) => formatTimestamp(entry.timestamp) },
          ]}
          renderActions={() => null}
        />
      )}
    </div>
  )
}
