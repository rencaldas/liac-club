import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../auth/AuthContext'
import { ROLE_LABELS } from '../../../auth/roles'
import { useUnsavedChangesGuard } from '../../../hooks/useUnsavedChangesGuard'
import { EntityFormLayout } from '../../../components/staff/EntityFormLayout'
import { ImageUploadField } from '../../../components/staff/ImageUploadField'
import { ApiError } from '../../../services/rest/ApiError'
import { deleteImage } from '../../../services/storage'
import { AVATAR_IMAGE_CONSTRAINTS } from '../../../utils/image'
import type { AuthSession, SocialLink } from '../../../types/entities'
import styles from './ProfileForm.module.css'

interface FormState {
  displayName: string
  email: string
  photoUrl: string
  area: string
  instagram: string
  linkedin: string
  github: string
}

function socialLinkUrl(socialLinks: SocialLink[] | undefined, platform: SocialLink['platform']): string {
  return socialLinks?.find((link) => link.platform === platform)?.url ?? ''
}

function toFormState(session: AuthSession): FormState {
  return {
    displayName: session.displayName ?? '',
    email: session.email ?? '',
    photoUrl: session.photoUrl ?? '',
    area: session.area ?? '',
    instagram: socialLinkUrl(session.socialLinks, 'instagram'),
    linkedin: socialLinkUrl(session.socialLinks, 'linkedin'),
    github: socialLinkUrl(session.socialLinks, 'github'),
  }
}

export function ProfileForm() {
  const { session, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(() => (session ? toFormState(session) : ({} as FormState)))
  const [initialForm, setInitialForm] = useState<FormState>(form)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const hasUnsavedChanges = JSON.stringify(form) !== JSON.stringify(initialForm)
  const bypassUnsavedGuard = useUnsavedChangesGuard(hasUnsavedChanges)

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setSuccessMessage(null)
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof FormState, string>> = {}
    if (!form.displayName.trim()) errors.displayName = 'Informe seu nome.'
    if (!form.email.trim()) errors.email = 'Informe seu e-mail.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Informe um e-mail válido.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setGeneralError(null)
    setSuccessMessage(null)
    if (!validate() || !session) return

    const socialLinks: SocialLink[] = [
      ...(form.instagram.trim() ? [{ platform: 'instagram' as const, url: form.instagram.trim() }] : []),
      ...(form.linkedin.trim() ? [{ platform: 'linkedin' as const, url: form.linkedin.trim() }] : []),
      ...(session.role === 'desenvolvedor' && form.github.trim()
        ? [{ platform: 'github' as const, url: form.github.trim() }]
        : []),
    ]

    setIsSubmitting(true)
    try {
      await updateProfile({
        displayName: form.displayName,
        email: form.email,
        photoUrl: form.photoUrl || undefined,
        area: form.area || undefined,
        socialLinks,
      })
      if (initialForm.photoUrl && initialForm.photoUrl !== form.photoUrl) {
        void deleteImage(initialForm.photoUrl, session.token)
      }
      setInitialForm(form)
      bypassUnsavedGuard()
      setSuccessMessage('Perfil atualizado com sucesso.')
    } catch (err) {
      setGeneralError(err instanceof ApiError ? err.message : 'Não foi possível salvar. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session) return null

  return (
    <EntityFormLayout
      title="Editar perfil"
      onSubmit={handleSubmit}
      onCancel={() => navigate(-1)}
      isSubmitting={isSubmitting}
      generalError={generalError}
      successMessage={successMessage}
    >
      <ImageUploadField
        id="profile-photo"
        label="Foto de perfil"
        value={form.photoUrl}
        onChange={(value) => updateField('photoUrl', value)}
        constraints={AVATAR_IMAGE_CONSTRAINTS}
        previewAlt="Pré-visualização da foto de perfil"
        variant="avatar"
      />

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="profile-name">Nome</label>
          <input
            id="profile-name"
            value={form.displayName}
            onChange={(event) => updateField('displayName', event.target.value)}
            aria-invalid={Boolean(fieldErrors.displayName)}
            aria-describedby={fieldErrors.displayName ? 'profile-name-error' : undefined}
          />
          {fieldErrors.displayName && (
            <p id="profile-name-error" className={styles.errorText} role="alert">
              {fieldErrors.displayName}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="profile-email">E-mail</label>
          <input
            id="profile-email"
            type="email"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'profile-email-error' : undefined}
          />
          {fieldErrors.email && (
            <p id="profile-email-error" className={styles.errorText} role="alert">
              {fieldErrors.email}
            </p>
          )}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="profile-role">Cargo</label>
          <input id="profile-role" value={ROLE_LABELS[session.role]} disabled />
          <p className={styles.hint}>Só quem tem permissão de gestão de equipe pode alterar cargos.</p>
        </div>

        <div className={styles.field}>
          <label htmlFor="profile-area">Área de atuação</label>
          <input
            id="profile-area"
            value={form.area}
            onChange={(event) => updateField('area', event.target.value)}
            placeholder="Ex: Pesquisa, Marketing, Eventos…"
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="profile-instagram">Instagram</label>
          <input
            id="profile-instagram"
            type="url"
            value={form.instagram}
            onChange={(event) => updateField('instagram', event.target.value)}
            placeholder="https://instagram.com/..."
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="profile-linkedin">LinkedIn</label>
          <input
            id="profile-linkedin"
            type="url"
            value={form.linkedin}
            onChange={(event) => updateField('linkedin', event.target.value)}
            placeholder="https://linkedin.com/in/..."
          />
        </div>
      </div>

      {session.role === 'desenvolvedor' && (
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="profile-github">GitHub</label>
            <input
              id="profile-github"
              type="url"
              value={form.github}
              onChange={(event) => updateField('github', event.target.value)}
              placeholder="https://github.com/..."
            />
          </div>
        </div>
      )}
    </EntityFormLayout>
  )
}
