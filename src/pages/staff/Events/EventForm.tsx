import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiClient } from '../../../services/client'
import { useAuth } from '../../../auth/AuthContext'
import { useUnsavedChangesGuard } from '../../../hooks/useUnsavedChangesGuard'
import { EntityFormLayout } from '../../../components/staff/EntityFormLayout'
import { FeaturedToggle } from '../../../components/staff/FeaturedToggle'
import { LoadingState } from '../../../components/ui/LoadingState'
import type { Event, EventType } from '../../../types/entities'
import styles from './EventForm.module.css'

interface FormState {
  title: string
  startDate: string
  endDate: string
  location: string
  type: EventType
  description: string
  featured: boolean
}

const EMPTY_STATE: FormState = {
  title: '',
  startDate: '',
  endDate: '',
  location: '',
  type: 'workshop',
  description: '',
  featured: false,
}

const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: 'workshop', label: 'Workshop' },
  { value: 'congresso', label: 'Congresso' },
  { value: 'palestra', label: 'Palestra' },
]

function toFormState(item: Event): FormState {
  return {
    title: item.title,
    startDate: item.startDate,
    endDate: item.endDate,
    location: item.location,
    type: item.type,
    description: item.description,
    featured: item.featured ?? false,
  }
}

export function EventForm() {
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
    apiClient.getEventBySlug(slug).then((item) => {
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
    if (!form.startDate) errors.startDate = 'Informe a data de início.'
    if (!form.endDate) errors.endDate = 'Informe a data de fim.'
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      errors.endDate = 'A data de fim não pode ser anterior à data de início.'
    }
    if (!form.location.trim()) errors.location = 'Informe o local.'
    if (!form.description.trim()) errors.description = 'Informe uma descrição.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setGeneralError(null)
    if (!validate() || !session) return

    setIsSubmitting(true)
    try {
      const payload = { ...form }
      if (isEditing && slug) {
        await apiClient.updateEvent(slug, payload, session.token)
      } else {
        await apiClient.createEvent(payload, session.token)
      }
      setInitialForm(form)
      bypassUnsavedGuard()
      navigate('/portal-liac/eventos')
    } catch {
      setGeneralError('Não foi possível salvar. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <LoadingState label="Carregando evento…" />

  return (
    <EntityFormLayout
      title={isEditing ? 'Editar Evento' : 'Novo Evento'}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/portal-liac/eventos')}
      isSubmitting={isSubmitting}
      generalError={generalError}
    >
      <div className={styles.field}>
        <label htmlFor="event-title">Título</label>
        <input
          id="event-title"
          value={form.title}
          onChange={(event) => updateField('title', event.target.value)}
          aria-invalid={Boolean(fieldErrors.title)}
          aria-describedby={fieldErrors.title ? 'event-title-error' : undefined}
        />
        {fieldErrors.title && (
          <p id="event-title-error" className={styles.errorText} role="alert">
            {fieldErrors.title}
          </p>
        )}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="event-startDate">Data de início</label>
          <input
            id="event-startDate"
            type="date"
            value={form.startDate}
            onChange={(event) => updateField('startDate', event.target.value)}
            aria-invalid={Boolean(fieldErrors.startDate)}
            aria-describedby={fieldErrors.startDate ? 'event-startDate-error' : undefined}
          />
          {fieldErrors.startDate && (
            <p id="event-startDate-error" className={styles.errorText} role="alert">
              {fieldErrors.startDate}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="event-endDate">Data de fim</label>
          <input
            id="event-endDate"
            type="date"
            value={form.endDate}
            onChange={(event) => updateField('endDate', event.target.value)}
            aria-invalid={Boolean(fieldErrors.endDate)}
            aria-describedby={fieldErrors.endDate ? 'event-endDate-error' : undefined}
          />
          {fieldErrors.endDate && (
            <p id="event-endDate-error" className={styles.errorText} role="alert">
              {fieldErrors.endDate}
            </p>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="event-location">Local</label>
        <input
          id="event-location"
          value={form.location}
          onChange={(event) => updateField('location', event.target.value)}
          aria-invalid={Boolean(fieldErrors.location)}
          aria-describedby={fieldErrors.location ? 'event-location-error' : undefined}
        />
        {fieldErrors.location && (
          <p id="event-location-error" className={styles.errorText} role="alert">
            {fieldErrors.location}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="event-type">Tipo</label>
        <select id="event-type" value={form.type} onChange={(event) => updateField('type', event.target.value as EventType)}>
          {EVENT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="event-description">Descrição</label>
        <textarea
          id="event-description"
          rows={4}
          value={form.description}
          onChange={(event) => updateField('description', event.target.value)}
          aria-invalid={Boolean(fieldErrors.description)}
          aria-describedby={fieldErrors.description ? 'event-description-error' : undefined}
        />
        {fieldErrors.description && (
          <p id="event-description-error" className={styles.errorText} role="alert">
            {fieldErrors.description}
          </p>
        )}
      </div>

      <FeaturedToggle checked={form.featured} onChange={(checked) => updateField('featured', checked)} />
    </EntityFormLayout>
  )
}
