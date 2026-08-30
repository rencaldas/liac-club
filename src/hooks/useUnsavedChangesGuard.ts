import { useCallback, useEffect, useRef } from 'react'
import { useBlocker } from 'react-router-dom'

/**
 * Warns before an in-app navigation (useBlocker) or a tab close/reload (beforeunload) discards
 * unsaved form changes (FR-011, specs/002-liac-staff-area/spec.md).
 *
 * Returns a `bypass()` callback: call it right before an intentional `navigate()` after a
 * successful save. Without it, the blocker still sees the pre-save `hasUnsavedChanges=true` from
 * the last completed render (state updates from the save haven't re-rendered yet when `navigate`
 * runs synchronously after them), so the very save that clears the dirty state ends up
 * triggering its own "discard unsaved changes?" prompt.
 */
export function useUnsavedChangesGuard(hasUnsavedChanges: boolean) {
  const bypassRef = useRef(false)

  useBlocker(() => {
    if (bypassRef.current) {
      bypassRef.current = false
      return false
    }
    if (!hasUnsavedChanges) return false
    return !window.confirm('Você tem alterações não salvas. Deseja sair sem salvar?')
  })

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!hasUnsavedChanges) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  return useCallback(() => {
    bypassRef.current = true
  }, [])
}
