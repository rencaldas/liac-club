import { useState, type FormEvent } from 'react'
import { apiClient } from '../../services/client'
import { validateContactForm } from '../../utils/validateContactForm'
import { Button } from '../ui/Button'
import type { ContactFormErrors, ContactFormPayload } from '../../types/entities'
import styles from './ContactForm.module.css'

// Placeholder institutional contact channels — replace with the LIAC's real phone/e-mail.
const ALTERNATE_PHONE = '(21) 99999-9999'
const ALTERNATE_EMAIL = 'contato@liac.ufrj.br'

const EMPTY_PAYLOAD: ContactFormPayload = {
  name: '',
  email: '',
  phone: '',
  preferredContactTime: '',
  message: '',
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

interface FieldConfig {
  name: keyof ContactFormPayload
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea'
  autoComplete?: string
}

const FIELDS: FieldConfig[] = [
  { name: 'name', label: 'Nome', type: 'text', autoComplete: 'name' },
  { name: 'email', label: 'E-mail', type: 'email', autoComplete: 'email' },
  { name: 'phone', label: 'Telefone', type: 'tel', autoComplete: 'tel' },
  { name: 'preferredContactTime', label: 'Melhor horário para contato', type: 'text' },
  { name: 'message', label: 'Conte-nos sobre sua necessidade', type: 'textarea' },
]

export function ContactForm() {
  const [payload, setPayload] = useState<ContactFormPayload>(EMPTY_PAYLOAD)
  const [errors, setErrors] = useState<ContactFormErrors>({})
  const [status, setStatus] = useState<Status>('idle')

  function updateField(name: keyof ContactFormPayload, value: string) {
    setPayload((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const validationErrors = validateContactForm(payload)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setStatus('submitting')
    try {
      await apiClient.submitContactForm(payload)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {FIELDS.map((field) => {
        const error = errors[field.name]
        const inputId = `contact-${field.name}`
        const errorId = `${inputId}-error`

        return (
          <div
            key={field.name}
            className={[styles.field, error && styles.fieldInvalid].filter(Boolean).join(' ')}
          >
            <label htmlFor={inputId}>{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                id={inputId}
                rows={4}
                value={payload[field.name]}
                onChange={(event) => updateField(field.name, event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
              />
            ) : (
              <input
                id={inputId}
                type={field.type}
                autoComplete={field.autoComplete}
                value={payload[field.name]}
                onChange={(event) => updateField(field.name, event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
              />
            )}
            {error && (
              <p id={errorId} className={styles.errorText} role="alert">
                {error}
              </p>
            )}
          </div>
        )
      })}

      <Button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Enviando…' : 'Enviar'}
      </Button>

      {status === 'success' && (
        <div className={styles.confirmation} role="status">
          <p>
            Ao responder o formulário, nossa equipe entrará em contato em até 36h para agendar
            uma reunião diagnóstico.
          </p>
          <p>
            Caso queira entrar em contato por outras vias: {ALTERNATE_PHONE}, {ALTERNATE_EMAIL}
          </p>
        </div>
      )}

      {status === 'error' && (
        <p className={styles.errorText} role="alert">
          Não foi possível enviar sua mensagem. Tente novamente em instantes.
        </p>
      )}
    </form>
  )
}
