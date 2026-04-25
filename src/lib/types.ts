import type { Accessor, JSX } from "solid-js"

// ─── Edge model ──────────────────────────────────────────────────────────────

export type Edge = "left" | "right" | "top" | "bottom"

export type Occupancy = "none" | "reserved" | "visible-driven"

export type Visibility = "visible" | "hidden"

export type Reveal = "always" | "scroll-toward" | "pointer-proximity" | "manual"

export type Span = "full" | "inset"

export type AxisPriority = "horizontal" | "vertical"

export type CornerOwners = {
  topLeft?: { edge: Edge; order?: number }
  topRight?: { edge: Edge; order?: number }
  bottomLeft?: { edge: Edge; order?: number }
  bottomRight?: { edge: Edge; order?: number }
}

// ─── Surface descriptor ───────────────────────────────────────────────────────

export type SurfaceDescriptor = {
  edge: Edge
  occupancy: Occupancy
  visibility: Visibility
  reveal: Reveal
  /** Measured border-box size along the surface's axis; set by ResizeObserver. "0px" until first measure. */
  actualSize: string
  /** Stacking order among surfaces on the same edge. Lower = closer to viewport edge. */
  order: number
  /** Grid track override (e.g. scroll-coupled partial reveal). When set, takes precedence over actualSize. */
  reservedSize?: string
  /**
   * For reserved surfaces: whether this surface claims ("full") or yields ("inset") corner cells.
   * For overlay surfaces: whether to stretch to the full viewport edge or stay inset within rail bounds.
   */
  span?: Span
}

export type RegisteredSurface = SurfaceDescriptor & { id: string }

// ─── Grid structure ───────────────────────────────────────────────────────────

/** Counts of reserved surfaces per edge, used by overlay surfaces for span computation. */
export type GridStructure = {
  topCount: number
  bottomCount: number
  leftCount: number
  rightCount: number
}

// ─── Context ──────────────────────────────────────────────────────────────────

export type LayoutContextValue = {
  surfaces: Accessor<RegisteredSurface[]>
  registerSurface: (descriptor: SurfaceDescriptor) => string
  unregisterSurface: (id: string) => void
  updateSurface: (id: string, updates: Partial<SurfaceDescriptor>) => void
  scrollContainer: Accessor<HTMLElement | null>
  setScrollContainer: (el: HTMLElement | null) => void
  gridStructure: Accessor<GridStructure>
}

// ─── createSurface ────────────────────────────────────────────────────────────

export type CreateSurfaceOptions = {
  edge: Edge
  occupancy?: Occupancy
  visibility?: Visibility
  reveal?: Reveal
  order?: number
  span?: Span
}

export type SurfaceHandle = {
  id: string
  visibility: Accessor<Visibility>
  setVisibility: (v: Visibility) => void
  actualSize: Accessor<string>
  setActualSize: (v: string) => void
  surface: Accessor<RegisteredSurface | undefined>
}

// ─── Component props ──────────────────────────────────────────────────────────

export type LayoutRootProps = {
  children?: JSX.Element
  class?: string
  style?: JSX.CSSProperties
  /** Which axis owns corner cells when span/corners don't resolve the conflict. Default: "horizontal" */
  axisPriority?: AxisPriority
  /** Per-corner explicit overrides (highest priority). */
  corners?: CornerOwners
}

export type BodyProps = {
  children?: JSX.Element
  class?: string
  style?: JSX.CSSProperties
}

export type RailProps = {
  edge: Edge
  children?: JSX.Element
  /** Default: "reserved" */
  occupancy?: Occupancy
  /** Default: "always" */
  reveal?: Reveal
  /** Switch to overlay mode below this breakpoint (px). Default: 768. */
  breakpoint?: number
  /** When true, switches from reserved to overlay below `breakpoint`. */
  responsive?: boolean
  /** Stacking order among same-edge surfaces. Default: 0 */
  order?: number
  /**
   * Corner cell ownership: "full" = claim all corner cells in this surface's rows/columns;
   * "inset" = yield them to crossing surfaces.
   */
  span?: Span
  class?: string
  style?: JSX.CSSProperties
}

export type OverlayProps = {
  edge: Edge
  open: boolean
  children?: JSX.Element
  /** Stacking order among same-edge surfaces. Default: 0 */
  order?: number
  /**
   * "full" (default) = stretch to full viewport edge, including over rail tracks.
   * "inset" = bounded by crossing-axis rail tracks.
   */
  span?: Span
  class?: string
  style?: JSX.CSSProperties
}

export type SurfaceProps = {
  edge: Edge
  /** Whether to render as overlay (absolute) vs reserved (grid-area). Default: false */
  overlay?: boolean
  occupancy?: Occupancy
  reveal?: Reveal
  visibility?: Visibility
  order?: number
  span?: Span
  /** z-index for overlay mode. Default: 10 */
  zIndex?: number
  /** Value for data-ss-surface attribute. Default: "surface" */
  surfaceType?: string
  children?: JSX.Element
  class?: string
  style?: JSX.CSSProperties
  /** Callback that receives the SurfaceHandle after mount */
  ref?: (handle: SurfaceHandle) => void
  /** Callback that receives the root DOM element after mount */
  domRef?: (el: HTMLElement) => void
}
