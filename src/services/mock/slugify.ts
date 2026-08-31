const COMBINING_DIACRITICS = /[̀-ͯ]/g

/** Turns a title into a URL-safe slug, disambiguating collisions with existing slugs by appending `-2`, `-3`, etc. */
export function slugify(title: string, existingSlugs: Iterable<string>): string {
  const base = title
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const taken = new Set(existingSlugs)
  if (!taken.has(base)) return base

  let suffix = 2
  while (taken.has(`${base}-${suffix}`)) suffix += 1
  return `${base}-${suffix}`
}
