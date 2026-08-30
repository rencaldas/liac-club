import type { PaginatedResult, PaginationParams } from '../ApiClient'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 12

/** Mirrors the `page`/`pageSize` query params documented in specs/contracts/api-contract.md. */
export function paginate<T>(items: T[], params?: PaginationParams): PaginatedResult<T> {
  const page = params?.page ?? DEFAULT_PAGE
  const pageSize = params?.pageSize ?? DEFAULT_PAGE_SIZE
  const start = (page - 1) * pageSize

  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    total: items.length,
  }
}
