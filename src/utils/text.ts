/** Joins author names as "A", "A e B", or "A, B e C" (used by ArticleCard and ArticleDetail). */
export function formatAuthors(authors: string[]): string {
  if (authors.length <= 1) return authors[0] ?? ''
  return `${authors.slice(0, -1).join(', ')} e ${authors[authors.length - 1]}`
}

/** Max length for the excerpt shown on listing cards, before an ellipsis is appended. */
export const CARD_EXCERPT_LIMIT = 180

/**
 * Trims text to `limit` characters for listing cards, cutting on a word boundary
 * when possible and appending an ellipsis. Returns the original text if it fits.
 */
export function truncate(text: string, limit = CARD_EXCERPT_LIMIT): string {
  if (!text) return ''
  const trimmed = text.trim()
  if (trimmed.length <= limit) return trimmed
  const slice = trimmed.slice(0, limit).trimEnd()
  const lastSpace = slice.lastIndexOf(' ')
  const base = lastSpace > limit * 0.6 ? slice.slice(0, lastSpace) : slice
  return `${base.replace(/[.,;:!?…-]+$/, '')}…`
}
