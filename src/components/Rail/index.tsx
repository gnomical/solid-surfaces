import {
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js"
import { useLayout } from "../../context/LayoutContext"
import { DEFAULT_BREAKPOINT, DEFAULT_RAIL_SIZE, POINTER_PROXIMITY_THRESHOLD, SCROLL_TOWARD_THRESHOLD } from "../../lib/constants"
import type { Occupancy, RailProps, SurfaceHandle, Visibility } from "../../lib/types"
import { Surface } from "../Surface"

export function Rail(props: RailProps) {
  const { updateSurface } = useLayout()

  const size = () => props.size ?? DEFAULT_RAIL_SIZE
  const reveal = () => props.reveal ?? "always"
  const breakpoint = () => props.breakpoint ?? DEFAULT_BREAKPOINT
  const initialOccupancy: Occupancy = props.occupancy ?? "reserved"

  const [overlayMode, setOverlayMode] = createSignal(false)
  const effectiveOccupancy = (): Occupancy =>
    overlayMode() ? "none" : initialOccupancy

  let handle!: SurfaceHandle

  // Sync occupancy changes back to context
  createEffect(() => {
    if (handle) updateSurface(handle.id, { occupancy: effectiveOccupancy() })
  })

  // ── Responsive breakpoint ────────────────────────────────────────────────────
  onMount(() => {
    if (!props.responsive) return

    const mq = window.matchMedia(`(max-width: ${breakpoint() - 1}px)`)
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setOverlayMode(e.matches)
      if (handle) handle.setVisibility(e.matches ? "hidden" : "visible")
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

      const scrollingToward =
        (edge === "top" && dy < -SCROLL_TOWARD_THRESHOLD) ||
        (edge === "bottom" && dy > SCROLL_TOWARD_THRESHOLD) ||
        (edge === "left" && dx < -SCROLL_TOWARD_THRESHOLD) ||
        (edge === "right" && dx > SCROLL_TOWARD_THRESHOLD)

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

  return (
    <Surface
      ref={(h) => { handle = h }}
      edge={props.edge}
      overlay={overlayMode() || effectiveOccupancy() === "none"}
      occupancy={effectiveOccupancy()}
      reveal={reveal()}
      size={size()}
      order={props.order ?? 0}
      zIndex={10}
      surfaceType="rail"
      class={props.class}
      style={props.style}
    >
      {props.children}
    </Surface>
  )
}
