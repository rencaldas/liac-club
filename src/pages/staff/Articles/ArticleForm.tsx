import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiClient } from '../../../services/client'
import { useAuth } from '../../../auth/AuthContext'
import { useUnsavedChangesGuard } from '../../../hooks/useUnsavedChangesGuard'
import { EntityFormLayout } from '../../../components/staff/EntityFormLayout'
import { FeaturedToggle } from '../../../components/staff/FeaturedToggle'
import { LoadingState } from '../../../components/ui/LoadingState'
import type { ScientificArticle } from '../../../types/entities'
import styles from './ArticleForm.module.css'

interface FormState {
  title: string
  authors: string
  abstract: string
  tags: string
  externalUrl: string
  featured: boolean
}

const EMPTY_STATE: FormState = {
  title: '',
  authors: '',
  abstract: '',
  tags: '',
  externalUrl: '',
  featured: false,
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function toFormState(item: ScientificArticle): FormState {
  return {
    title: item.title,
    authors: item.authors.join(', '),
    abstract: item.abstract,
    tags: item.tags.join(', '),
    externalUrl: item.externalUrl,
    featured: item.featured ?? false,
  }
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export function ArticleForm() {
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
    apiClient.getArticleBySlug(slug).then((item) => {
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
    if (splitList(form.authors).length === 0) errors.authors = 'Informe ao menos um autor.'
    if (!form.abstract.trim()) errors.abstract = 'Informe um resumo.'
    if (!form.externalUrl.trim() || !isValidUrl(form.externalUrl.trim())) {
      errors.externalUrl = 'Informe uma URL válida (ex: https://...).'
    }
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
        authors: splitList(form.authors),
        abstract: form.abstract,
        tags: splitList(form.tags),
        externalUrl: form.externalUrl,
        featured: form.featured,
      }
      if (isEditing && slug) {
        await apiClient.updateArticle(slug, payload, session.token)
      } else {
        await apiClient.createArticle(payload, session.token)
      }
      setInitialForm(form)
      bypassUnsavedGuard()
      navigate('/portal-liac/artigos')
    } catch {
      setGeneralError('Não foi possível salvar. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <LoadingState label="Carregando artigo…" />

  return (
    <EntityFormLayout
      title={isEditing ? 'Editar Artigo' : 'Novo Artigo'}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/portal-liac/artigos')}
      isSubmitting={isSubmitting}
      generalError={generalError}
    >
      <div className={styles.field}>
        <label htmlFor="article-title">Título</label>
        <input
          id="article-title"
          value={form.title}
          onChange={(event) => updateField('title', event.target.value)}
          aria-invalid={Boolean(fieldErrors.title)}
          aria-describedby={fieldErrors.title ? 'article-title-error' : undefined}
        />
        {fieldErrors.title && (
          <p id="article-title-error" className={styles.errorText} role="alert">
            {fieldErrors.title}
          </p>
        )}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="article-authors">Autores (separados por vírgula)</label>
          <input
            id="article-authors"
            value={form.authors}
            onChange={(event) => updateField('authors', event.target.value)}
            placeholder="Ana Beatriz Ramos, Carla Menezes"
            aria-invalid={Boolean(fieldErrors.authors)}
            aria-describedby={fieldErrors.authors ? 'article-authors-error' : undefined}
          />
          {fieldErrors.authors && (
            <p id="article-authors-error" className={styles.errorText} role="alert">
              {fieldErrors.authors}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="article-tags">Tags (separadas por vírgula, opcional)</label>
          <input
            id="article-tags"
            value={form.tags}
            onChange={(event) => updateField('tags', event.target.value)}
            placeholder="formulação, envelhecimento cutâneo"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="article-abstract">Resumo</label>
        <textarea
          id="article-abstract"
          rows={4}
          value={form.abstract}
          onChange={(event) => updateField('abstract', event.target.value)}
          aria-invalid={Boolean(fieldErrors.abstract)}
          aria-describedby={fieldErrors.abstract ? 'article-abstract-error' : undefined}
        />
        {fieldErrors.abstract && (
          <p id="article-abstract-error" className={styles.errorText} role="alert">
            {fieldErrors.abstract}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="article-externalUrl">Link externo (PDF/DOI)</label>
        <input
          id="article-externalUrl"
          value={form.externalUrl}
          onChange={(event) => updateField('externalUrl', event.target.value)}
          placeholder="https://doi.org/..."
          aria-invalid={Boolean(fieldErrors.externalUrl)}
          aria-describedby={fieldErrors.externalUrl ? 'article-externalUrl-error' : undefined}
        />
        {fieldErrors.externalUrl && (
          <p id="article-externalUrl-error" className={styles.errorText} role="alert">
            {fieldErrors.externalUrl}
          </p>
        )}
      </div>

      <FeaturedToggle checked={form.featured} onChange={(checked) => updateField('featured', checked)} />
    </EntityFormLayout>
  )
}
