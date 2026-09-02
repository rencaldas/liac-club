import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiClient } from '../../../services/client'
import { useAuth } from '../../../auth/AuthContext'
import { useUnsavedChangesGuard } from '../../../hooks/useUnsavedChangesGuard'
import { EntityFormLayout } from '../../../components/staff/EntityFormLayout'
import { LoadingState } from '../../../components/ui/LoadingState'
import type { Testimonial } from '../../../types/entities'
import styles from './TestimonialForm.module.css'

interface FormState {
  name: string
  text: string
}

const EMPTY_STATE: FormState = {
  name: '',
  text: '',
}

function toFormState(item: Testimonial): FormState {
  return {
    name: item.name,
    text: item.text,
  }
}

export function TestimonialForm() {
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
    apiClient.getTestimonials().then((testimonials) => {
      if (cancelled) return
      const item = testimonials.find((testimonial) => testimonial.id === id)
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
    if (!form.name.trim()) errors.name = 'Informe o nome do ligante.'
    if (!form.text.trim()) errors.text = 'Informe o depoimento.'
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
        name: form.name.trim(),
        text: form.text.trim(),
      }
      if (isEditing && id) {
        await apiClient.updateTestimonial(id, payload, session.token)
      } else {
        await apiClient.createTestimonial(payload, session.token)
      }
      setInitialForm(form)
      bypassUnsavedGuard()
      navigate('/portal-equipe/depoimentos')
    } catch {
      setGeneralError('Não foi possível salvar. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <LoadingState label="Carregando depoimento…" />

  return (
    <EntityFormLayout
      title={isEditing ? 'Editar Depoimento' : 'Novo Depoimento'}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/portal-equipe/depoimentos')}
      isSubmitting={isSubmitting}
      generalError={generalError}
    >
      <div className={styles.field}>
        <label htmlFor="testimonial-name">Nome do ligante</label>
        <input
          id="testimonial-name"
          value={form.name}
          onChange={(event) => updateField('name', event.target.value)}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? 'testimonial-name-error' : undefined}
        />
        {fieldErrors.name && (
          <p id="testimonial-name-error" className={styles.errorText} role="alert">
            {fieldErrors.name}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="testimonial-text">Depoimento</label>
        <textarea
          id="testimonial-text"
          rows={5}
          value={form.text}
          onChange={(event) => updateField('text', event.target.value)}
          placeholder="Conte como foi a experiência na LIAC…"
          aria-invalid={Boolean(fieldErrors.text)}
          aria-describedby={fieldErrors.text ? 'testimonial-text-error' : undefined}
        />
        {fieldErrors.text && (
          <p id="testimonial-text-error" className={styles.errorText} role="alert">
            {fieldErrors.text}
          </p>
        )}
      </div>
    </EntityFormLayout>
  )
}
