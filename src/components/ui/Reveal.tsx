import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { revealOnView } from '../../utils/scrollReveal'
import styles from './Reveal.module.css'

export type RevealVariant =
  | 'fade-up'
  | 'fade-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom'
  | 'flip-up'

const VARIANT_CLASS: Record<RevealVariant, string> = {
  'fade-up': styles.fadeUp,
  'fade-down': styles.fadeDown,
  'slide-left': styles.slideLeft,
  'slide-right': styles.slideRight,
  zoom: styles.zoom,
  'flip-up': styles.flipUp,
}

interface RevealProps {
  children: ReactNode
  /** Which entrance the element plays when it scrolls into view. */
  variant?: RevealVariant
  /** Delay before the entrance starts, in ms — stagger siblings by bumping this. */
  delay?: number
  /** Extra classes for the wrapper (it's a plain block-level `div`). */
  className?: string
  style?: CSSProperties
}

/**
 * Wraps content in a `div` that animates (opacity + transform only, GPU-composited) from a
 * hidden pose to its resting state the first time it enters the viewport. The reveal is
 * driven by one shared observer and toggled straight on the DOM node, so there's no React
 * re-render and no per-element observer. Reduced-motion users get an instant static render.
 */
export function Reveal({
  children,
  variant = 'fade-up',
  delay = 0,
  className,
  style,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return revealOnView(el, () => {
      el.dataset.revealed = 'true'
    })
  }, [])

  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${VARIANT_CLASS[variant]} ${className ?? ''}`.trim()}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
    >
      {children}
    </div>
  )
}
