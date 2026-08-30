/** Joins author names as "A", "A e B", or "A, B e C" (used by ArticleCard and ArticleDetail). */
export function formatAuthors(authors: string[]): string {
  if (authors.length <= 1) return authors[0] ?? ''
  return `${authors.slice(0, -1).join(', ')} e ${authors[authors.length - 1]}`
}
