import { useEffect, useRef, useState } from 'react'

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error'

export interface AsyncResourceState<T> {
  status: AsyncStatus
  data: T | null
  error: unknown
}

function defaultIsEmpty(data: unknown): boolean {
  if (Array.isArray(data)) return data.length === 0
  if (data && typeof data === 'object' && 'items' in data) {
    return Array.isArray((data as { items: unknown }).items) && (data as { items: unknown[] }).items.length === 0
  }
  return false
}

/**
 * Wraps a call to ApiClient with loading/empty/success/error state, reused by every listing and
 * detail page (see research.md §3 for why this is a single shared hook rather than duplicated
 * per page).
 */
export function useAsyncResource<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[],
  isEmpty: (data: T) => boolean = defaultIsEmpty,
): AsyncResourceState<T> {
  const [state, setState] = useState<AsyncResourceState<T>>({
    status: 'loading',
    data: null,
    error: null,
  })
  const fetchFnRef = useRef(fetchFn)
  fetchFnRef.current = fetchFn

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading', data: null, error: null })

    fetchFnRef.current()
      .then((data) => {
        if (cancelled) return
        setState({
          status: isEmpty(data) ? 'empty' : 'success',
          data,
          error: null,
        })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setState({ status: 'error', data: null, error })
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
