const formatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

/** Formats a single ISO date (YYYY-MM-DD) as a localized pt-BR date. */
export function formatDate(isoDate: string): string {
  // Intl parses bare "YYYY-MM-DD" as UTC midnight; append a local-noon time to avoid off-by-one
  // day shifts in timezones behind UTC.
  return formatter.format(new Date(`${isoDate}T12:00:00`))
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
