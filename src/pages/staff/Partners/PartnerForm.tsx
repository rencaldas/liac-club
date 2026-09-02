import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiClient } from '../../../services/client'
import { useAuth } from '../../../auth/AuthContext'
import { useUnsavedChangesGuard } from '../../../hooks/useUnsavedChangesGuard'
import { EntityFormLayout } from '../../../components/staff/EntityFormLayout'
import { ImageUploadField } from '../../../components/staff/ImageUploadField'
import { LoadingState } from '../../../components/ui/LoadingState'
import { LOGO_IMAGE_CONSTRAINTS } from '../../../utils/image'
import type { Partner } from '../../../types/entities'
import styles from './PartnerForm.module.css'

interface FormState {
  name: string
  externalUrl: string
  tier: string
  logoUrl: string
}

const EMPTY_STATE: FormState = {
  name: '',
  externalUrl: '',
  tier: '',
  logoUrl: '',
}

function toFormState(item: Partner): FormState {
  return {
    name: item.name,
    externalUrl: item.externalUrl,
    tier: item.tier ?? '',
    logoUrl: item.logoUrl ?? '',
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

export function PartnerForm() {
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
    apiClient.getPartners().then((partners) => {
      if (cancelled) return
      const item = partners.find((partner) => partner.id === id)
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
    if (!form.name.trim()) errors.name = 'Informe o nome do parceiro.'
    if (!form.externalUrl.trim()) {
      errors.externalUrl = 'Informe o link do parceiro.'
    } else if (!isValidUrl(form.externalUrl.trim())) {
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
        name: form.name,
        externalUrl: form.externalUrl.trim(),
        tier: form.tier.trim() || undefined,
        logoUrl: form.logoUrl,
      }
      if (isEditing && id) {
        await apiClient.updatePartner(id, payload, session.token)
      } else {
        await apiClient.createPartner(payload, session.token)
      }
      setInitialForm(form)
      bypassUnsavedGuard()
      navigate('/portal-equipe/parceiros')
    } catch {
      setGeneralError('Não foi possível salvar. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <LoadingState label="Carregando parceiro…" />

  return (
    <EntityFormLayout
      title={isEditing ? 'Editar Parceiro' : 'Novo Parceiro'}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/portal-equipe/parceiros')}
      isSubmitting={isSubmitting}
      generalError={generalError}
    >
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="partner-name">Nome</label>
          <input
            id="partner-name"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? 'partner-name-error' : undefined}
          />
          {fieldErrors.name && (
            <p id="partner-name-error" className={styles.errorText} role="alert">
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="partner-tier">Nível (opcional)</label>
          <input
            id="partner-tier"
            value={form.tier}
            onChange={(event) => updateField('tier', event.target.value)}
            placeholder="Parceiro Institucional, Apoiador…"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="partner-externalUrl">Link do parceiro</label>
        <input
          id="partner-externalUrl"
          value={form.externalUrl}
          onChange={(event) => updateField('externalUrl', event.target.value)}
          placeholder="https://..."
          aria-invalid={Boolean(fieldErrors.externalUrl)}
          aria-describedby={fieldErrors.externalUrl ? 'partner-externalUrl-error' : undefined}
        />
        {fieldErrors.externalUrl && (
          <p id="partner-externalUrl-error" className={styles.errorText} role="alert">
            {fieldErrors.externalUrl}
          </p>
        )}
      </div>

      <ImageUploadField
        id="partner-logo"
        label="Logo (opcional)"
        value={form.logoUrl}
        onChange={(value) => updateField('logoUrl', value)}
        constraints={LOGO_IMAGE_CONSTRAINTS}
        previewAlt="Pré-visualização do logo"
      />
    </EntityFormLayout>
  )
}
