const formatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const shortFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

/** Parses a bare "YYYY-MM-DD" at local noon so timezones behind UTC don't shift the day.
 *  Returns null for missing or unparseable input so callers can render a fallback instead
 *  of letting `Intl.format` throw a RangeError mid-render. */
function parseIsoDate(isoDate: string | null | undefined): Date | null {
  if (!isoDate) return null
  const date = new Date(`${isoDate}T12:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Formats a single ISO date (YYYY-MM-DD) as a localized pt-BR date, or '' if invalid. */
export function formatDate(isoDate: string): string {
  const date = parseIsoDate(isoDate)
  return date ? formatter.format(date) : ''
}

/** Formats a single ISO date (YYYY-MM-DD) as a compact dd/mm/yyyy pt-BR date, or '' if invalid. */
export function formatDateShort(isoDate: string): string {
  const date = parseIsoDate(isoDate)
  return date ? shortFormatter.format(date) : ''
}

/**
 * Returns a single formatted date when the event lasts one day (startDate === endDate), or a
 * "start – end" range otherwise. See spec.md Edge Cases and data-model.md (Event.endDate).
 */
export function formatEventDateRange(startDate: string, endDate: string): string {
  if (startDate === endDate) {
    return formatDate(startDate)
  }
  return `${formatDate(startDate)} – ${formatDate(endDate)}`
}

/**
 * Compact dd/mm/yyyy version of {@link formatEventDateRange}, e.g. "17/02/2023 à 17/05/2023".
 * Used where table space is limited, such as the staff Eventos list.
 */
export function formatEventDateRangeShort(startDate: string, endDate: string): string {
  if (startDate === endDate) {
    return formatDateShort(startDate)
  }
  return `${formatDateShort(startDate)} à ${formatDateShort(endDate)}`
}
