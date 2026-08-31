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

/** Formats a single ISO date (YYYY-MM-DD) as a localized pt-BR date. */
export function formatDate(isoDate: string): string {
  // Intl parses bare "YYYY-MM-DD" as UTC midnight; append a local-noon time to avoid off-by-one
  // day shifts in timezones behind UTC.
  return formatter.format(new Date(`${isoDate}T12:00:00`))
}

/** Formats a single ISO date (YYYY-MM-DD) as a compact dd/mm/yyyy pt-BR date. */
export function formatDateShort(isoDate: string): string {
  return shortFormatter.format(new Date(`${isoDate}T12:00:00`))
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
