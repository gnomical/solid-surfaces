import { DEFAULT_BREAKPOINT, POINTER_PROXIMITY_THRESHOLD } from "./constants"
import type { Edge, Occupancy, Reveal, Visibility } from "./types"

export type RailControllerOptions = {
  edge: Edge
  reveal: Reveal
  responsive: boolean
  breakpoint: number
  getScrollContainer: () => HTMLElement | null
  getActualSize: () => number
  onVisibilityChange: (v: Visibility) => void
  onReservedSizeChange: (size: string | undefined) => void
  onOccupancyChange: (occ: Occupancy) => void
}

export class RailController {
  private opts: RailControllerOptions
  private surfaceEl: HTMLElement | null = null
  private cleanups: Array<() => void> = []

  // scroll-toward state
  private attached: HTMLElement | null = null
  private lastScrollPos = 0
  private lastDelta = 0
  private virtualPos = 0
  private rafId: number | null = null

  constructor(opts: RailControllerOptions) {
    this.opts = opts
  }

  connect(surfaceEl: HTMLElement): void {
    this.surfaceEl = surfaceEl
    if (this.opts.responsive) this.setupResponsive()
    if (this.opts.reveal === "scroll-toward") this.setupScrollToward()
    if (this.opts.reveal === "pointer-proximity") this.setupPointerProximity()
  }

  disconnect(): void {
    for (const fn of this.cleanups) fn()
    this.cleanups = []
    if (this.attached) {
      this.attached.removeEventListener("scroll", this.onScroll as EventListener)
      this.attached.removeEventListener("scrollend", this.onScrollEnd)
      this.attached = null
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  /** Call from a Solid createEffect watching handle.actualSize() to keep reservedSize in sync mid-scroll. */
  notifyActualSizeChanged(): void {
    if (this.attached && this.virtualPos > 0) this.commit()
  }

  /** Call when the scrollContainer changes (e.g. from a Solid createEffect watching scrollContainer()). */
  notifyScrollContainerChanged(): void {
    if (this.opts.reveal !== "scroll-toward") return
    this.detachScroll()
    this.attachScroll()
  }

  // ── Responsive ───────────────────────────────────────────────────────────────

  private setupResponsive(): void {
    const bp = this.opts.breakpoint ?? DEFAULT_BREAKPOINT
    const mq = window.matchMedia(`(max-width: ${bp - 1}px)`)
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      const isOverlay = e.matches
      this.opts.onOccupancyChange(isOverlay ? "none" : "reserved")
      this.opts.onVisibilityChange(isOverlay ? "hidden" : "visible")
    }
    handler(mq)
    mq.addEventListener("change", handler as (e: MediaQueryListEvent) => void)
    this.cleanups.push(() =>
      mq.removeEventListener("change", handler as (e: MediaQueryListEvent) => void)
    )
  }

  // ── Scroll-toward ────────────────────────────────────────────────────────────

  private get translateAxis() {
    return this.opts.edge === "left" || this.opts.edge === "right" ? "X" : "Y"
  }

  private get translateSign() {
    return this.opts.edge === "left" || this.opts.edge === "top" ? -1 : 1
  }

  private applyChildTransform(): void {
    const child = this.surfaceEl?.firstElementChild as HTMLElement | null
    if (!child) return
    child.style.transform =
      this.virtualPos > 0
        ? `translate${this.translateAxis}(${this.translateSign * this.virtualPos}px)`
        : ""
  }

  private commit(): void {
    const railPx = this.opts.getActualSize()
    this.opts.onReservedSizeChange(
      this.virtualPos > 0 ? `${railPx - this.virtualPos}px` : undefined
    )
    this.applyChildTransform()
  }

  private snapTo(target: number): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId)
    const step = () => {
      const diff = target - this.virtualPos
      if (Math.abs(diff) <= 1) {
        this.virtualPos = target
        this.commit()
        this.rafId = null
        return
      }
      this.virtualPos += diff * 0.2
      this.commit()
      this.rafId = requestAnimationFrame(step)
    }
    this.rafId = requestAnimationFrame(step)
  }

  private onScrollEnd = (): void => {
    const railPx = this.opts.getActualSize()
    if (this.virtualPos === 0 || this.virtualPos === railPx) return
    this.snapTo(this.lastDelta > 0 ? railPx : 0)
  }

  private syncScroll(scrollPos: number, el: HTMLElement): void {
    const railPx = this.opts.getActualSize()
    const delta = scrollPos - this.lastScrollPos
    if (delta !== 0) this.lastDelta = delta
    this.virtualPos = Math.min(Math.max(0, this.virtualPos + delta), railPx)
    this.lastScrollPos = scrollPos

    const horizontal = this.opts.edge === "left" || this.opts.edge === "right"
    const atTop = scrollPos <= 0
    const atBottom = horizontal
      ? scrollPos >= el.scrollWidth - el.clientWidth - 1
      : scrollPos >= el.scrollHeight - el.clientHeight - 1

    if (atTop) this.virtualPos = 0
    else if (atBottom) this.virtualPos = railPx

    this.commit()
  }

  private onScroll = function (this: RailController & HTMLElement): void {
    // 'this' is the scroll container when called as an event listener,
    // but we bind it to the controller; the container is passed via closure.
    // Instead we use an arrow wrapper below.
  }

  private makeScrollHandler(container: HTMLElement) {
    return () => {
      if (this.rafId !== null) { cancelAnimationFrame(this.rafId); this.rafId = null }
      const scrollPos =
        this.opts.edge === "left" || this.opts.edge === "right"
          ? container.scrollLeft
          : container.scrollTop
      this.syncScroll(scrollPos, container)
    }
  }

  private scrollHandler: (() => void) | null = null

  private detachScroll(): void {
    if (this.attached && this.scrollHandler) {
      this.attached.removeEventListener("scroll", this.scrollHandler)
      this.attached.removeEventListener("scrollend", this.onScrollEnd)
      if (this.rafId !== null) { cancelAnimationFrame(this.rafId); this.rafId = null }
      this.attached = null
      this.scrollHandler = null
    }
  }

  private attachScroll(): void {
    const container = this.opts.getScrollContainer()
    if (!container) return
    const scrollPos =
      this.opts.edge === "left" || this.opts.edge === "right"
        ? container.scrollLeft
        : container.scrollTop
    this.lastScrollPos = scrollPos
    this.virtualPos = Math.min(scrollPos, this.opts.getActualSize())
    this.commit()
    this.scrollHandler = this.makeScrollHandler(container)
    container.addEventListener("scroll", this.scrollHandler, { passive: true })
    container.addEventListener("scrollend", this.onScrollEnd, { passive: true })
    this.attached = container
  }

  private setupScrollToward(): void {
    this.attachScroll()
    // The Solid adapter must call notifyScrollContainerChanged() when the container changes.
    // Cleanup of listeners happens in disconnect().
  }

  // ── Pointer-proximity ────────────────────────────────────────────────────────

  private setupPointerProximity(): void {
    let lastVisibility: Visibility = "hidden"

    const onPointerMove = (e: PointerEvent) => {
      const edge = this.opts.edge
      let distance: number
      if (edge === "top") distance = e.clientY
      else if (edge === "bottom") distance = window.innerHeight - e.clientY
      else if (edge === "left") distance = e.clientX
      else distance = window.innerWidth - e.clientX

      const next: Visibility =
        distance <= POINTER_PROXIMITY_THRESHOLD ? "visible" : "hidden"
      if (next !== lastVisibility) {
        lastVisibility = next
        this.opts.onVisibilityChange(next)
      }
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true })
    this.cleanups.push(() =>
      window.removeEventListener("pointermove", onPointerMove)
    )
  }
}
