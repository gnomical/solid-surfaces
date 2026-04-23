import {
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  type JSX,
} from "solid-js"
import { useLayout } from "../../context/LayoutContext"
import { DEFAULT_BREAKPOINT, DEFAULT_RAIL_SIZE, POINTER_PROXIMITY_THRESHOLD } from "../../lib/constants"
import type { Occupancy, RailProps, SurfaceHandle, Visibility } from "../../lib/types"
import { Surface } from "../Surface"


export function Rail(props: RailProps) {
  const { updateSurface, scrollContainer } = useLayout()

  const size = () => props.size ?? DEFAULT_RAIL_SIZE
  const reveal = () => props.reveal ?? "always"
  const breakpoint = () => props.breakpoint ?? DEFAULT_BREAKPOINT
  const initialOccupancy: Occupancy = props.occupancy ?? "reserved"

  const [overlayMode, setOverlayMode] = createSignal(false)
  const effectiveOccupancy = (): Occupancy =>
    overlayMode() ? "none" : initialOccupancy

  const scrollStyle = (): JSX.CSSProperties => props.style ?? {}

  let handle!: SurfaceHandle
  let railEl!: HTMLElement

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

    let railPx = 0
    let attached: HTMLElement | null = null
    let lastScrollPos = 0
    let virtualPos = 0  // tracks header visibility independent of absolute scroll position

    function sync(scrollPos: number, el: HTMLElement) {
      const delta = scrollPos - lastScrollPos
      virtualPos = Math.min(Math.max(0, virtualPos + delta), railPx)
      lastScrollPos = scrollPos

      const horizontal = props.edge === "left" || props.edge === "right"
      const atTop = scrollPos <= 0
      const atBottom = horizontal
        ? scrollPos >= el.scrollWidth - el.clientWidth - 1
        : scrollPos >= el.scrollHeight - el.clientHeight - 1

      if (atTop) virtualPos = 0
      else if (atBottom) virtualPos = railPx

      updateSurface(handle.id, { currentSize: `${railPx - virtualPos}px` })
    }

    function onScroll(this: HTMLElement) {
      const scrollPos = props.edge === "left" || props.edge === "right"
        ? this.scrollLeft
        : this.scrollTop
      sync(scrollPos, this)
    }

    createEffect(() => {
      if (attached) {
        attached.removeEventListener("scroll", onScroll as EventListener)
        attached = null
      }
      const container = scrollContainer()
      if (container) {
        railPx = railEl.getBoundingClientRect()[
          props.edge === "left" || props.edge === "right" ? "width" : "height"
        ]
        const scrollPos = props.edge === "left" || props.edge === "right"
          ? container.scrollLeft
          : container.scrollTop
        lastScrollPos = scrollPos
        virtualPos = Math.min(scrollPos, railPx)
        updateSurface(handle.id, { currentSize: `${railPx - virtualPos}px` })
        container.addEventListener("scroll", onScroll as EventListener, { passive: true })
        attached = container
      }
    })

    onCleanup(() => {
      if (attached) attached.removeEventListener("scroll", onScroll as EventListener)
    })
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
      domRef={(el) => { railEl = el }}
      edge={props.edge}
      overlay={overlayMode() || effectiveOccupancy() === "none"}
      occupancy={effectiveOccupancy()}
      reveal={reveal()}
      size={size()}
      order={props.order ?? 0}
      zIndex={10}
      surfaceType="rail"
      class={props.class}
      style={scrollStyle()}
    >
      {props.children}
    </Surface>
  )
}
