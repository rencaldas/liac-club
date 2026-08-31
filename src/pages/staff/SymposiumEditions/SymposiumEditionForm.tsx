import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiClient } from '../../../services/client'
import { useAuth } from '../../../auth/AuthContext'
import { useUnsavedChangesGuard } from '../../../hooks/useUnsavedChangesGuard'
import { EntityFormLayout } from '../../../components/staff/EntityFormLayout'
import { FeaturedToggle } from '../../../components/staff/FeaturedToggle'
import { ImageUploadField } from '../../../components/staff/ImageUploadField'
import { LoadingState } from '../../../components/ui/LoadingState'
import type { SymposiumEdition } from '../../../types/entities'
import styles from './SymposiumEditionForm.module.css'

interface FormState {
  title: string
  year: string
  startDate: string
  endDate: string
  location: string
  description: string
  coverImageUrl: string
  externalUrl: string
  featured: boolean
}

const EMPTY_STATE: FormState = {
  title: '',
  year: '',
  startDate: '',
  endDate: '',
  location: '',
  description: '',
  coverImageUrl: '',
  externalUrl: '',
  featured: false,
}

function toFormState(item: SymposiumEdition): FormState {
  return {
    title: item.title,
    year: String(item.year),
    startDate: item.startDate,
    endDate: item.endDate,
    location: item.location,
    description: item.description,
    coverImageUrl: item.coverImageUrl ?? '',
    externalUrl: item.externalUrl ?? '',
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

export function SymposiumEditionForm() {
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
    apiClient.getSymposiumEditionBySlug(slug).then((item) => {
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
    if (!form.year.trim() || !Number.isInteger(Number(form.year))) errors.year = 'Informe um ano válido.'
    if (!form.startDate) errors.startDate = 'Informe a data de início.'
    if (!form.endDate) errors.endDate = 'Informe a data de fim.'
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      errors.endDate = 'A data de fim não pode ser anterior à data de início.'
    }
    if (!form.location.trim()) errors.location = 'Informe o local.'
    if (!form.description.trim()) errors.description = 'Informe uma descrição.'
    if (form.externalUrl.trim() && !isValidUrl(form.externalUrl.trim())) {
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
        year: Number(form.year),
        startDate: form.startDate,
        endDate: form.endDate,
        location: form.location,
        description: form.description,
        coverImageUrl: form.coverImageUrl || undefined,
        externalUrl: form.externalUrl.trim() || undefined,
        featured: form.featured,
      }
      if (isEditing && slug) {
        await apiClient.updateSymposiumEdition(slug, payload, session.token)
      } else {
        await apiClient.createSymposiumEdition(payload, session.token)
      }
      setInitialForm(form)
      bypassUnsavedGuard()
      navigate('/portal-liac/edicoes-anteriores')
    } catch {
      setGeneralError('Não foi possível salvar. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <LoadingState label="Carregando edição…" />

  return (
    <EntityFormLayout
      title={isEditing ? 'Editar Edição' : 'Nova Edição'}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/portal-liac/edicoes-anteriores')}
      isSubmitting={isSubmitting}
      generalError={generalError}
    >
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="edition-title">Título</label>
          <input
            id="edition-title"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            aria-invalid={Boolean(fieldErrors.title)}
            aria-describedby={fieldErrors.title ? 'edition-title-error' : undefined}
          />
          {fieldErrors.title && (
            <p id="edition-title-error" className={styles.errorText} role="alert">
              {fieldErrors.title}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="edition-year">Ano</label>
          <input
            id="edition-year"
            type="number"
            value={form.year}
            onChange={(event) => updateField('year', event.target.value)}
            aria-invalid={Boolean(fieldErrors.year)}
            aria-describedby={fieldErrors.year ? 'edition-year-error' : undefined}
          />
          {fieldErrors.year && (
            <p id="edition-year-error" className={styles.errorText} role="alert">
              {fieldErrors.year}
            </p>
          )}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="edition-startDate">Data de início</label>
          <input
            id="edition-startDate"
            type="date"
            value={form.startDate}
            onChange={(event) => updateField('startDate', event.target.value)}
            aria-invalid={Boolean(fieldErrors.startDate)}
            aria-describedby={fieldErrors.startDate ? 'edition-startDate-error' : undefined}
          />
          {fieldErrors.startDate && (
            <p id="edition-startDate-error" className={styles.errorText} role="alert">
              {fieldErrors.startDate}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="edition-endDate">Data de fim</label>
          <input
            id="edition-endDate"
            type="date"
            value={form.endDate}
            onChange={(event) => updateField('endDate', event.target.value)}
            aria-invalid={Boolean(fieldErrors.endDate)}
            aria-describedby={fieldErrors.endDate ? 'edition-endDate-error' : undefined}
          />
          {fieldErrors.endDate && (
            <p id="edition-endDate-error" className={styles.errorText} role="alert">
              {fieldErrors.endDate}
            </p>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="edition-location">Local</label>
        <input
          id="edition-location"
          value={form.location}
          onChange={(event) => updateField('location', event.target.value)}
          aria-invalid={Boolean(fieldErrors.location)}
          aria-describedby={fieldErrors.location ? 'edition-location-error' : undefined}
        />
        {fieldErrors.location && (
          <p id="edition-location-error" className={styles.errorText} role="alert">
            {fieldErrors.location}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="edition-description">Descrição</label>
        <textarea
          id="edition-description"
          rows={4}
          value={form.description}
          onChange={(event) => updateField('description', event.target.value)}
          aria-invalid={Boolean(fieldErrors.description)}
          aria-describedby={fieldErrors.description ? 'edition-description-error' : undefined}
        />
        {fieldErrors.description && (
          <p id="edition-description-error" className={styles.errorText} role="alert">
            {fieldErrors.description}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="edition-externalUrl">Link externo (anais/fotos, opcional)</label>
        <input
          id="edition-externalUrl"
          value={form.externalUrl}
          onChange={(event) => updateField('externalUrl', event.target.value)}
          placeholder="https://..."
          aria-invalid={Boolean(fieldErrors.externalUrl)}
          aria-describedby={fieldErrors.externalUrl ? 'edition-externalUrl-error' : undefined}
        />
        {fieldErrors.externalUrl && (
          <p id="edition-externalUrl-error" className={styles.errorText} role="alert">
            {fieldErrors.externalUrl}
          </p>
        )}
      </div>

      <ImageUploadField
        id="edition-cover"
        label="Imagem de capa (opcional)"
        value={form.coverImageUrl}
        onChange={(value) => updateField('coverImageUrl', value)}
      />

      <FeaturedToggle checked={form.featured} onChange={(checked) => updateField('featured', checked)} />
    </EntityFormLayout>
  )
}
