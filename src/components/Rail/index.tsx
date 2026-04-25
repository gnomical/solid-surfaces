import {
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  type JSX,
} from "solid-js"
import { useLayout } from "../../context/LayoutContext"
import { DEFAULT_BREAKPOINT, POINTER_PROXIMITY_THRESHOLD } from "../../lib/constants"
import type { Occupancy, RailProps, SurfaceHandle, Visibility } from "../../lib/types"
import { Surface } from "../Surface"


export function Rail(props: RailProps) {
  const { updateSurface, scrollContainer } = useLayout()

  const reveal = () => props.reveal ?? "always"
  const breakpoint = () => props.breakpoint ?? DEFAULT_BREAKPOINT
  const initialOccupancy: Occupancy = props.occupancy ?? "reserved"

  const [overlayMode, setOverlayMode] = createSignal(false)
  const effectiveOccupancy = (): Occupancy =>
    overlayMode() ? "none" : initialOccupancy

  const scrollStyle = (): JSX.CSSProperties => props.style ?? {}

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

    let attached: HTMLElement | null = null
    let lastScrollPos = 0
    let lastDelta = 0
    let virtualPos = 0
    let rafId: number | null = null

    const getRailPx = () => parseFloat(handle.actualSize()) || 0

    function commit() {
      // Clear reservedSize when fully visible so the grid tracks actualSize directly,
      // avoiding a ResizeObserver → reservedSize → resize → ResizeObserver loop.
      updateSurface(handle.id, {
        reservedSize: virtualPos > 0 ? `${getRailPx() - virtualPos}px` : undefined,
      })
    }

    function snapTo(target: number) {
      if (rafId !== null) cancelAnimationFrame(rafId)
      function step() {
        const diff = target - virtualPos
        if (Math.abs(diff) <= 1) {
          virtualPos = target
          commit()
          rafId = null
          return
        }
        virtualPos += diff * 0.2
        commit()
        rafId = requestAnimationFrame(step)
      }
      rafId = requestAnimationFrame(step)
    }

    function onScrollEnd() {
      const railPx = getRailPx()
      if (virtualPos === 0 || virtualPos === railPx) return
      snapTo(lastDelta > 0 ? railPx : 0)
    }

    function sync(scrollPos: number, el: HTMLElement) {
      const railPx = getRailPx()
      const delta = scrollPos - lastScrollPos
      if (delta !== 0) lastDelta = delta
      virtualPos = Math.min(Math.max(0, virtualPos + delta), railPx)
      lastScrollPos = scrollPos

      const horizontal = props.edge === "left" || props.edge === "right"
      const atTop = scrollPos <= 0
      const atBottom = horizontal
        ? scrollPos >= el.scrollWidth - el.clientWidth - 1
        : scrollPos >= el.scrollHeight - el.clientHeight - 1

      if (atTop) virtualPos = 0
      else if (atBottom) virtualPos = railPx

      commit()
    }

    function onScroll(this: HTMLElement) {
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
      const scrollPos = props.edge === "left" || props.edge === "right"
        ? this.scrollLeft
        : this.scrollTop
      sync(scrollPos, this)
    }

    // Re-run commit when actualSize changes during a partial-reveal so reservedSize stays in sync.
    // Only fires when mid-scroll; at rest (virtualPos === 0) the grid uses actualSize directly.
    createEffect(() => {
      void handle.actualSize()
      if (attached && virtualPos > 0) commit()
    })

    createEffect(() => {
      if (attached) {
        attached.removeEventListener("scroll", onScroll as EventListener)
        attached.removeEventListener("scrollend", onScrollEnd)
        if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
        attached = null
      }
      const container = scrollContainer()
      if (container) {
        const scrollPos = props.edge === "left" || props.edge === "right"
          ? container.scrollLeft
          : container.scrollTop
        lastScrollPos = scrollPos
        virtualPos = Math.min(scrollPos, getRailPx())
        commit()
        container.addEventListener("scroll", onScroll as EventListener, { passive: true })
        container.addEventListener("scrollend", onScrollEnd, { passive: true })
        attached = container
      }
    })

    onCleanup(() => {
      if (attached) {
        attached.removeEventListener("scroll", onScroll as EventListener)
        attached.removeEventListener("scrollend", onScrollEnd)
      }
      if (rafId !== null) cancelAnimationFrame(rafId)
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
      edge={props.edge}
      overlay={overlayMode() || effectiveOccupancy() === "none"}
      occupancy={effectiveOccupancy()}
      reveal={reveal()}
      order={props.order ?? 0}
      span={props.span}
      zIndex={10}
      surfaceType="rail"
      class={props.class}
      style={scrollStyle()}
    >
      {props.children}
    </Surface>
  )
}
