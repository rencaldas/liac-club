import type { ContactFormErrors, ContactFormPayload } from '../types/entities'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Accepts BR phone numbers with or without mask — just checks digit count (10 or 11: DDD + 8/9-digit number). */
function isValidBrPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  return digits.length === 10 || digits.length === 11
}

export function validateContactForm(payload: ContactFormPayload): ContactFormErrors {
  const errors: ContactFormErrors = {}

  if (!payload.name.trim()) {
    errors.name = 'Informe seu nome.'
  }

  if (!payload.email.trim()) {
    errors.email = 'Informe seu e-mail.'
  } else if (!EMAIL_PATTERN.test(payload.email.trim())) {
    errors.email = 'Informe um e-mail válido.'
  }

  if (!payload.phone.trim()) {
    errors.phone = 'Informe seu telefone.'
  } else if (!isValidBrPhone(payload.phone)) {
    errors.phone = 'Informe um telefone válido, com DDD.'
  }

  if (!payload.preferredContactTime.trim()) {
    errors.preferredContactTime = 'Informe o melhor horário para contato.'
  }

  if (!payload.message.trim()) {
    errors.message = 'Conte-nos sobre sua necessidade.'
  }

  return errors
}
