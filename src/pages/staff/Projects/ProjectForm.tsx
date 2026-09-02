import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiClient } from '../../../services/client'
import { useAuth } from '../../../auth/AuthContext'
import { useUnsavedChangesGuard } from '../../../hooks/useUnsavedChangesGuard'
import { EntityFormLayout } from '../../../components/staff/EntityFormLayout'
import { LoadingState } from '../../../components/ui/LoadingState'
import type { ResearchProject, ResearchProjectStatus } from '../../../types/entities'
import styles from './ProjectForm.module.css'

interface FormState {
  title: string
  status: ResearchProjectStatus
  summary: string
  members: string
  publishedAt: string
}

const EMPTY_STATE: FormState = {
  title: '',
  status: 'ativo',
  summary: '',
  members: '',
  publishedAt: '',
}

const STATUS_OPTIONS: { value: ResearchProjectStatus; label: string }[] = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'concluído', label: 'Concluído' },
]

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function toFormState(item: ResearchProject): FormState {
  return {
    title: item.title,
    status: item.status,
    summary: item.summary,
    members: item.members.join(', '),
    publishedAt: item.publishedAt ?? '',
  }
}

export function ProjectForm() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const { session } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(EMPTY_STATE)
  const [initialForm, setInitialForm] = useState<FormState>(EMPTY_STATE)
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    apiClient.getProjects({ pageSize: 100 }).then((result) => {
      if (cancelled) return
      const item = result.items.find((project) => project.id === id)
      if (!item) return
      const state = toFormState(item)
      setForm(state)
      setInitialForm(state)
      setIsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [id])

  const hasUnsavedChanges = JSON.stringify(form) !== JSON.stringify(initialForm)
  const bypassUnsavedGuard = useUnsavedChangesGuard(hasUnsavedChanges)

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof FormState, string>> = {}
    if (!form.title.trim()) errors.title = 'Informe um título.'
    if (!form.summary.trim()) errors.summary = 'Informe um resumo.'
    if (splitList(form.members).length === 0) errors.members = 'Informe ao menos um integrante.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setGeneralError(null)
    if (!validate() || !session) return

    setIsSubmitting(true)
    try {
      const payload = {
        title: form.title,
        status: form.status,
        summary: form.summary,
        members: splitList(form.members),
        publishedAt: form.publishedAt || undefined,
      }
      if (isEditing && id) {
        await apiClient.updateProject(id, payload, session.token)
      } else {
        await apiClient.createProject(payload, session.token)
      }
      setInitialForm(form)
      bypassUnsavedGuard()
      navigate('/portal-equipe/projetos')
    } catch {
      setGeneralError('Não foi possível salvar. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <LoadingState label="Carregando projeto…" />

  return (
    <EntityFormLayout
      title={isEditing ? 'Editar Projeto' : 'Novo Projeto'}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/portal-equipe/projetos')}
      isSubmitting={isSubmitting}
      generalError={generalError}
    >
      <div className={styles.field}>
        <label htmlFor="project-title">Título</label>
        <input
          id="project-title"
          value={form.title}
          onChange={(event) => updateField('title', event.target.value)}
          aria-invalid={Boolean(fieldErrors.title)}
          aria-describedby={fieldErrors.title ? 'project-title-error' : undefined}
        />
        {fieldErrors.title && (
          <p id="project-title-error" className={styles.errorText} role="alert">
            {fieldErrors.title}
          </p>
        )}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="project-status">Status</label>
          <select
            id="project-status"
            value={form.status}
            onChange={(event) => updateField('status', event.target.value as ResearchProjectStatus)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="project-publishedAt">Data de publicação</label>
          <input
            id="project-publishedAt"
            type="date"
            value={form.publishedAt}
            onChange={(event) => updateField('publishedAt', event.target.value)}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="project-summary">Resumo</label>
        <textarea
          id="project-summary"
          rows={4}
          value={form.summary}
          onChange={(event) => updateField('summary', event.target.value)}
          aria-invalid={Boolean(fieldErrors.summary)}
          aria-describedby={fieldErrors.summary ? 'project-summary-error' : undefined}
        />
        {fieldErrors.summary && (
          <p id="project-summary-error" className={styles.errorText} role="alert">
            {fieldErrors.summary}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="project-members">Integrantes (separados por vírgula)</label>
        <input
          id="project-members"
          value={form.members}
          onChange={(event) => updateField('members', event.target.value)}
          placeholder="Ana Beatriz Ramos, Carla Menezes"
          aria-invalid={Boolean(fieldErrors.members)}
          aria-describedby={fieldErrors.members ? 'project-members-error' : undefined}
        />
        {fieldErrors.members && (
          <p id="project-members-error" className={styles.errorText} role="alert">
            {fieldErrors.members}
          </p>
        )}
      </div>
    </EntityFormLayout>
  )
}
