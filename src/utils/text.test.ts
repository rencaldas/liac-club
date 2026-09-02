import { describe, expect, it } from 'vitest'
import { CARD_EXCERPT_LIMIT, formatAuthors, truncate } from './text'

describe('formatAuthors', () => {
  it('formats one, two and three authors', () => {
    expect(formatAuthors(['Ana'])).toBe('Ana')
    expect(formatAuthors(['Ana', 'Bia'])).toBe('Ana e Bia')
    expect(formatAuthors(['Ana', 'Bia', 'Caio'])).toBe('Ana, Bia e Caio')
  })
})

describe('truncate', () => {
  it('leaves short text untouched', () => {
    expect(truncate('Texto curto.')).toBe('Texto curto.')
  })

  it('cuts long text on a word boundary and appends an ellipsis', () => {
    const long = 'palavra '.repeat(60).trim()
    const result = truncate(long)

    expect(result.length).toBeLessThanOrEqual(CARD_EXCERPT_LIMIT + 1)
    expect(result.endsWith('…')).toBe(true)
    expect(result).not.toContain(' …')
  })

  it('respects a custom limit', () => {
    expect(truncate('um dois tres quatro cinco', 10)).toBe('um dois…')
  })
})
