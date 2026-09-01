type RevealCallback = () => void

/**
 * One shared IntersectionObserver for every <Reveal> on the page, instead of one observer
 * per element. Each target fires its callback once, then is unobserved and forgotten, so
 * there's no ongoing work after a section has appeared.
 */
const pending = new Map<Element, RevealCallback>()
let observer: IntersectionObserver | undefined
let unsupported = false

function ensureObserver(): IntersectionObserver | undefined {
  if (observer || unsupported) return observer
  if (typeof IntersectionObserver === 'undefined') {
    unsupported = true
    return undefined
  }
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const cb = pending.get(entry.target)
        if (!cb) continue
        pending.delete(entry.target)
        observer?.unobserve(entry.target)
        cb()
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.15 },
  )
  return observer
}

/**
 * Runs `cb` once, the first time `el` scrolls into view. Returns a cleanup function.
 * Fires synchronously when IntersectionObserver isn't available (e.g. jsdom) so content
 * is never left hidden.
 */
export function revealOnView(el: Element, cb: RevealCallback): () => void {
  const obs = ensureObserver()
  if (!obs) {
    cb()
    return () => {}
  }
  pending.set(el, cb)
  obs.observe(el)
  return () => {
    pending.delete(el)
    obs.unobserve(el)
  }
}
