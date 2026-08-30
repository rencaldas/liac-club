/**
 * Temporary placeholder for routes not yet implemented by their user story. Each Phase 3+ task
 * in specs/001-liac-club-platform/tasks.md replaces its own placeholder route(s) with the real
 * page component — this component is never meant to ship.
 */
export function RoutePlaceholder({ label }: { label: string }) {
  return (
    <div className="liac-container" style={{ paddingBlock: '3rem' }}>
      <p className="liac-eyebrow">Em construção</p>
      <h1>{label}</h1>
    </div>
  )
}
