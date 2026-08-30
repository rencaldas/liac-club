/**
 * Slugs are authored fields on the fixtures, not generated at runtime (research.md §7) — this
 * only looks items up, it never derives a slug from a title.
 */
export function findBySlug<T extends { slug: string }>(collection: T[], slug: string): T | null {
  return collection.find((item) => item.slug === slug) ?? null
}
