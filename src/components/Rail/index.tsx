import {
  createEffect,
  createSignal,
  JSX,
  onCleanup,
  onMount,
} from "solid-js"
import { createSurface, useLayout } from "../../context/LayoutContext"
import { DEFAULT_BREAKPOINT, DEFAULT_RAIL_SIZE, POINTER_PROXIMITY_THRESHOLD, SCROLL_TOWARD_THRESHOLD } from "../../lib/constants"
import type { Edge, Occupancy, RailProps, Visibility } from "../../lib/types"
import styles from "./Rail.module.css"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isHorizontal(edge: Edge) {
  return edge === "left" || edge === "right"
}

function sizeStyle(edge: Edge, size: string): JSX.CSSProperties {
  return isHorizontal(edge) ? { width: size } : { height: size }
}

// ─── Rail ─────────────────────────────────────────────────────────────────────

export function Rail(props: RailProps) {
  const { updateSurface } = useLayout()

  const size = () => props.size ?? DEFAULT_RAIL_SIZE
  const reveal = () => props.reveal ?? "always"
  const breakpoint = () => props.breakpoint ?? DEFAULT_BREAKPOINT
  const initialOccupancy: Occupancy = props.occupancy ?? "reserved"

  // Responsive: track whether we're in overlay mode due to narrow viewport
  const [overlayMode, setOverlayMode] = createSignal(false)

  const effectiveOccupancy = (): Occupancy =>
    overlayMode() ? "none" : initialOccupancy

  const handle = createSurface({
    edge: props.edge,
    occupancy: effectiveOccupancy(),
    reveal: reveal(),
    size: size(),
    order: props.order ?? 0,
  })

  // Sync occupancy changes back to context
  createEffect(() => {
    updateSurface(handle.id, { occupancy: effectiveOccupancy() })
  })

  // ── Responsive breakpoint ────────────────────────────────────────────────────
  onMount(() => {
    if (!props.responsive) return

    const mq = window.matchMedia(`(max-width: ${breakpoint() - 1}px)`)
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setOverlayMode(e.matches)
      if (e.matches) {
        handle.setVisibility("hidden")
      } else {
        handle.setVisibility("visible")
      }
    }
    handler(mq)
    mq.addEventListener("change", handler as (e: MediaQueryListEvent) => void)
    onCleanup(() =>
      mq.removeEventListener("change", handler as (e: MediaQueryListEvent) => void)
    )
  })

  // ── Reveal: scroll-toward ────────────────────────────────────────────────────
  onMount(() => {
    if (reveal() !== "scroll-toward") return

    let lastScrollY = window.scrollY
    let lastScrollX = window.scrollX

    function onScroll() {
      const dy = window.scrollY - lastScrollY
      const dx = window.scrollX - lastScrollX

      const edge = props.edge
      let scrollingToward = false

      if (edge === "top" && dy < -SCROLL_TOWARD_THRESHOLD) scrollingToward = true
      if (edge === "bottom" && dy > SCROLL_TOWARD_THRESHOLD) scrollingToward = true
      if (edge === "left" && dx < -SCROLL_TOWARD_THRESHOLD) scrollingToward = true
      if (edge === "right" && dx > SCROLL_TOWARD_THRESHOLD) scrollingToward = true

      const scrollingAway =
        (edge === "top" && dy > SCROLL_TOWARD_THRESHOLD) ||
        (edge === "bottom" && dy < -SCROLL_TOWARD_THRESHOLD) ||
        (edge === "left" && dx > SCROLL_TOWARD_THRESHOLD) ||
        (edge === "right" && dx < -SCROLL_TOWARD_THRESHOLD)

      if (scrollingToward) handle.setVisibility("visible")
      else if (scrollingAway) handle.setVisibility("hidden")

      lastScrollY = window.scrollY
      lastScrollX = window.scrollX
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    onCleanup(() => window.removeEventListener("scroll", onScroll))
  })

  // ── Reveal: pointer-proximity ────────────────────────────────────────────────
  onMount(() => {
    if (reveal() !== "pointer-proximity") return

    function onPointerMove(e: PointerEvent) {
      const edge = props.edge
      let distance: number

      if (edge === "top") distance = e.clientY
      else if (edge === "bottom") distance = window.innerHeight - e.clientY
      else if (edge === "left") distance = e.clientX
      else distance = window.innerWidth - e.clientX

      const next: Visibility =
        distance <= POINTER_PROXIMITY_THRESHOLD ? "visible" : "hidden"
      if (next !== handle.visibility()) handle.setVisibility(next)
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true })
    onCleanup(() => window.removeEventListener("pointermove", onPointerMove))
  })

  // ── Render ───────────────────────────────────────────────────────────────────

  const isOverlay = () => overlayMode() || effectiveOccupancy() === "none"
  const isHidden = () => handle.visibility() === "hidden"

  const classList = () => ({
    [styles.rail]: !isOverlay(),
    [styles.overlay]: isOverlay(),
    [styles.hidden]: isHidden(),
  })

  const inlineStyle = (): JSX.CSSProperties => ({
    ...(isOverlay() ? sizeStyle(props.edge, size()) : {}),
    ...props.style,
  })

  return (
    <div
      class={props.class}
      classList={classList()}
      style={inlineStyle()}
      data-ss-surface="rail"
      data-ss-edge={props.edge}
      data-ss-state={handle.visibility()}
    >
      {props.children}
    </div>
  )
}
