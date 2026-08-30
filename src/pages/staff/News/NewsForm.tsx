import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiClient } from '../../../services/client'
import { useAuth } from '../../../auth/AuthContext'
import { useUnsavedChangesGuard } from '../../../hooks/useUnsavedChangesGuard'
import { EntityFormLayout } from '../../../components/staff/EntityFormLayout'
import { FeaturedToggle } from '../../../components/staff/FeaturedToggle'
import { LoadingState } from '../../../components/ui/LoadingState'
import type { NewsItem } from '../../../types/entities'
import styles from './NewsForm.module.css'

interface FormState {
  title: string
  publishedAt: string
  category: string
  summary: string
  content: string
  coverImageUrl: string
  featured: boolean
}

const EMPTY_STATE: FormState = {
  title: '',
  publishedAt: '',
  category: '',
  summary: '',
  content: '',
  coverImageUrl: '',
  featured: false,
}

function toFormState(item: NewsItem): FormState {
  return {
    title: item.title,
    publishedAt: item.publishedAt,
    category: item.category,
    summary: item.summary,
    content: item.content,
    coverImageUrl: item.coverImageUrl ?? '',
    featured: item.featured ?? false,
  }
}

export function NewsForm() {
  const { slug } = useParams<{ slug: string }>()
  const isEditing = Boolean(slug)
  const { session } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(EMPTY_STATE)
  const [initialForm, setInitialForm] = useState<FormState>(EMPTY_STATE)
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    apiClient.getNewsBySlug(slug).then((item) => {
      if (cancelled || !item) return
      const state = toFormState(item)
      setForm(state)
      setInitialForm(state)
      setIsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [slug])

  const hasUnsavedChanges = JSON.stringify(form) !== JSON.stringify(initialForm)
  const bypassUnsavedGuard = useUnsavedChangesGuard(hasUnsavedChanges)

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof FormState, string>> = {}
    if (!form.title.trim()) errors.title = 'Informe um título.'
    if (!form.publishedAt) errors.publishedAt = 'Informe a data de publicação.'
    if (!form.category.trim()) errors.category = 'Informe uma categoria.'
    if (!form.summary.trim()) errors.summary = 'Informe um resumo.'
    if (!form.content.trim()) errors.content = 'Informe o conteúdo.'
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
        publishedAt: form.publishedAt,
        category: form.category,
        summary: form.summary,
        content: form.content,
        coverImageUrl: form.coverImageUrl || undefined,
        featured: form.featured,
      }
      if (isEditing && slug) {
        await apiClient.updateNews(slug, payload, session.token)
      } else {
        await apiClient.createNews(payload, session.token)
      }
      setInitialForm(form)
      bypassUnsavedGuard()
      navigate('/portal-liac/novidades')
    } catch {
      setGeneralError('Não foi possível salvar. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <LoadingState label="Carregando novidade…" />

  return (
    <EntityFormLayout
      title={isEditing ? 'Editar Novidade' : 'Nova Novidade'}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/portal-liac/novidades')}
      isSubmitting={isSubmitting}
      generalError={generalError}
    >
      <div className={styles.field}>
        <label htmlFor="news-title">Título</label>
        <input
          id="news-title"
          value={form.title}
          onChange={(event) => updateField('title', event.target.value)}
          aria-invalid={Boolean(fieldErrors.title)}
          aria-describedby={fieldErrors.title ? 'news-title-error' : undefined}
        />
        {fieldErrors.title && (
          <p id="news-title-error" className={styles.errorText} role="alert">
            {fieldErrors.title}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="news-publishedAt">Data de publicação</label>
        <input
          id="news-publishedAt"
          type="date"
          value={form.publishedAt}
          onChange={(event) => updateField('publishedAt', event.target.value)}
          aria-invalid={Boolean(fieldErrors.publishedAt)}
          aria-describedby={fieldErrors.publishedAt ? 'news-publishedAt-error' : undefined}
        />
        {fieldErrors.publishedAt && (
          <p id="news-publishedAt-error" className={styles.errorText} role="alert">
            {fieldErrors.publishedAt}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="news-category">Categoria</label>
        <input
          id="news-category"
          value={form.category}
          onChange={(event) => updateField('category', event.target.value)}
          aria-invalid={Boolean(fieldErrors.category)}
          aria-describedby={fieldErrors.category ? 'news-category-error' : undefined}
        />
        {fieldErrors.category && (
          <p id="news-category-error" className={styles.errorText} role="alert">
            {fieldErrors.category}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="news-summary">Resumo</label>
        <textarea
          id="news-summary"
          rows={2}
          value={form.summary}
          onChange={(event) => updateField('summary', event.target.value)}
          aria-invalid={Boolean(fieldErrors.summary)}
          aria-describedby={fieldErrors.summary ? 'news-summary-error' : undefined}
        />
        {fieldErrors.summary && (
          <p id="news-summary-error" className={styles.errorText} role="alert">
            {fieldErrors.summary}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="news-content">Conteúdo</label>
        <textarea
          id="news-content"
          rows={6}
          value={form.content}
          onChange={(event) => updateField('content', event.target.value)}
          aria-invalid={Boolean(fieldErrors.content)}
          aria-describedby={fieldErrors.content ? 'news-content-error' : undefined}
        />
        {fieldErrors.content && (
          <p id="news-content-error" className={styles.errorText} role="alert">
            {fieldErrors.content}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="news-cover">URL da imagem de capa (opcional)</label>
        <input
          id="news-cover"
          value={form.coverImageUrl}
          onChange={(event) => updateField('coverImageUrl', event.target.value)}
        />
      </div>

      <FeaturedToggle checked={form.featured} onChange={(checked) => updateField('featured', checked)} />
    </EntityFormLayout>
  )
}
