import type { Edge, Visibility } from "./types"

export type SlideControllerOptions = {
  edge: Edge
  getActualSize: () => number
  onReservedSizeChange: (size: string | undefined) => void
  onVisibilityChange: (v: Visibility) => void
  onTransformChange: (offset: number | null) => void
  /** Called each frame with the signed pixel change in reservedSize.
   *  Caller should subtract this from scrollTop/scrollLeft to hold content in place.
   *  Only wired for top/left edges. */
  onScrollAdjust?: (delta: number) => void
}

/**
 * Drives a slide-in/out animation by easing virtualOffset (0 = fully visible,
 * actualSize = fully hidden) each RAF tick, simultaneously shrinking/growing
 * the grid track via reservedSize and translating the surface child.
 *
 * Mirrors RailController's scroll-toward mechanism.
 */
export class SlideController {
  private opts: SlideControllerOptions
  // Fraction of actualSize we are offset from the visible position (0 = visible, 1 = hidden).
  // Stored as a fraction so it remains valid when actualSize changes (e.g. window resize).
  private offsetFraction = 0
  private rafId: number | null = null
  private target: "visible" | "hidden" = "visible"
  private prevReservedSize: number | null = null

  constructor(opts: SlideControllerOptions, initialVisibility: "visible" | "hidden" = "visible") {
    this.opts = opts
    if (initialVisibility === "hidden") this.offsetFraction = 1
  }

  get isAtRest(): boolean {
    return this.rafId === null
  }

  show(): void {
    this.target = "visible"
    if (this.offsetFraction === 0) {
      // Already fully visible
      this.opts.onReservedSizeChange(undefined)
      this.opts.onTransformChange(null)
      return
    }
    this.startRaf()
  }

  hide(): void {
    this.target = "hidden"
    if (this.offsetFraction >= 1) {
      // Already fully hidden
      this.opts.onVisibilityChange("hidden")
      this.opts.onReservedSizeChange("0px")
      this.opts.onTransformChange(null)
      return
    }
    this.startRaf()
  }

  disconnect(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  private startRaf(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId)
    // Seed prevReservedSize from the current fractional position so the first
    // commitFraction call (and any direction reversal) produces a correct delta.
    this.prevReservedSize = Math.max(0, this.opts.getActualSize() * (1 - this.offsetFraction))
    const targetFraction = this.target === "hidden" ? 1 : 0
    const step = () => {
      const diff = targetFraction - this.offsetFraction

      if (Math.abs(diff) <= 0.005) {
        this.offsetFraction = targetFraction
        this.commitFraction()
        this.settle()
        this.rafId = null
        return
      }

      this.offsetFraction += diff * 0.2
      this.commitFraction()
      this.rafId = requestAnimationFrame(step)
    }
    this.rafId = requestAnimationFrame(step)
  }

  private commitFraction(): void {
    const actualSize = this.opts.getActualSize()
    const offset = this.offsetFraction * actualSize
    const reservedSize = Math.max(0, actualSize - offset)
    if (this.opts.onScrollAdjust !== undefined && this.prevReservedSize !== null) {
      const delta = reservedSize - this.prevReservedSize
      if (delta !== 0) this.opts.onScrollAdjust(delta)
    }
    this.prevReservedSize = reservedSize
    this.opts.onReservedSizeChange(`${reservedSize}px`)
    this.opts.onTransformChange(offset)
  }

  private settle(): void {
    this.prevReservedSize = null
    if (this.target === "hidden") {
      this.opts.onVisibilityChange("hidden")
      // Keep reservedSize at "0px" — clearing it would revert to actualSize and cause a snap
      this.opts.onReservedSizeChange("0px")
      this.opts.onTransformChange(null)
    } else {
      // Clear reservedSize so the track reverts to being driven by actualSize normally
      this.opts.onReservedSizeChange(undefined)
      this.opts.onTransformChange(null)
    }
  }
}
