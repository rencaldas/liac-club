import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from './icons/ChevronIcon'
import styles from './Carousel.module.css'

interface CarouselProps {
  children: ReactNode
  ariaLabel: string
  /** Extra class applied to each slide wrapper, e.g. to widen slides for an image-forward layout. */
  slideClassName?: string
}

const DRAG_THRESHOLD_PX = 5
/** A drag shorter than this still advances one slide as long as it ended with a quick flick. */
const FLICK_DISTANCE_PX = 40
/** Pointer speed (px/ms) at release that counts as a flick even without much travel. */
const FLICK_VELOCITY = 0.3

export function Carousel({ children, ariaLabel, slideClassName }: CarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
    pointerId: 0,
    lastX: 0,
    lastTime: 0,
    velocityX: 0,
  })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    function updateScrollState() {
      if (!el) return
      setCanScrollPrev(el.scrollLeft > 4)
      setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
    }

    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [children])

  function scrollByPage(direction: 1 | -1) {
    const el = viewportRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  /**
   * Snap to the slide one step from the one nearest `fromScrollLeft`, so a short pull
   * to the side still advances a full item instead of springing back to the current one.
   */
  function snapToAdjacent(direction: 1 | -1, fromScrollLeft: number) {
    const el = viewportRef.current
    if (!el) return
    const slides = Array.from(el.children) as HTMLElement[]
    if (!slides.length) return
    const containerLeft = el.getBoundingClientRect().left
    const positions = slides.map((slide) => slide.getBoundingClientRect().left - containerLeft + el.scrollLeft)

    let anchor = 0
    let smallestGap = Infinity
    positions.forEach((position, index) => {
      const gap = Math.abs(position - fromScrollLeft)
      if (gap < smallestGap) {
        smallestGap = gap
        anchor = index
      }
    })

    const target = Math.min(Math.max(anchor + direction, 0), slides.length - 1)
    el.scrollTo({ left: positions[target], behavior: 'smooth' })
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const el = viewportRef.current
    if (!el || event.pointerType === 'touch') return
    dragRef.current = {
      isDragging: true,
      startX: event.clientX,
      startScrollLeft: el.scrollLeft,
      moved: false,
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocityX: 0,
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const el = viewportRef.current
    const state = dragRef.current
    if (!el || !state.isDragging) return
    const delta = event.clientX - state.startX
    if (Math.abs(delta) > DRAG_THRESHOLD_PX) {
      // Pointer capture is deferred until the gesture is confirmed as a drag: capturing
      // eagerly on every pointerdown makes Chromium retarget the resulting click event to
      // this div instead of the card/link under the cursor, silently swallowing plain clicks.
      if (!state.moved) {
        el.setPointerCapture(state.pointerId)
        el.classList.add(styles.dragging)
      }
      state.moved = true
    }
    const dt = event.timeStamp - state.lastTime
    if (dt > 0) state.velocityX = (event.clientX - state.lastX) / dt
    state.lastX = event.clientX
    state.lastTime = event.timeStamp
    el.scrollLeft = state.startScrollLeft - delta
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const el = viewportRef.current
    const state = dragRef.current
    if (el) {
      if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId)
      el.classList.remove(styles.dragging)

      if (state.isDragging && state.moved) {
        const dragged = el.scrollLeft - state.startScrollLeft
        let direction: 1 | -1 | 0 = 0
        if (Math.abs(dragged) >= FLICK_DISTANCE_PX) direction = dragged > 0 ? 1 : -1
        else if (Math.abs(state.velocityX) >= FLICK_VELOCITY) direction = state.velocityX < 0 ? 1 : -1
        if (direction !== 0) snapToAdjacent(direction, state.startScrollLeft)
      }
    }
    dragRef.current.isDragging = false
  }

  function suppressClickAfterDrag(event: ReactMouseEvent<HTMLDivElement>) {
    if (dragRef.current.moved) {
      event.preventDefault()
      event.stopPropagation()
      dragRef.current.moved = false
    }
  }

  function preventNativeDrag(event: ReactMouseEvent<HTMLDivElement>) {
    // Links and images start a native browser drag-and-drop gesture on mousedown+move,
    // which hijacks the pointer before our drag-to-scroll logic runs and shows the
    // browser's link-preview ghost. Block it so pointer events stay in control.
    event.preventDefault()
  }

  return (
    <div className={styles.wrapper}>
      <div
        ref={viewportRef}
        className={styles.viewport}
        role="group"
        aria-label={ariaLabel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={suppressClickAfterDrag}
        onDragStart={preventNativeDrag}
      >
        {Children.map(children, (child) => (
          <div
            className={`${styles.slide} ${slideClassName ?? ''}`}
            key={isValidElement(child) ? child.key : undefined}
          >
            {child}
          </div>
        ))}
      </div>

      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowPrev}`}
        onClick={() => scrollByPage(-1)}
        disabled={!canScrollPrev}
        aria-label="Anterior"
      >
        <ChevronLeftIcon />
      </button>
      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowNext}`}
        onClick={() => scrollByPage(1)}
        disabled={!canScrollNext}
        aria-label="Próximo"
      >
        <ChevronRightIcon />
      </button>
    </div>
  )
}
