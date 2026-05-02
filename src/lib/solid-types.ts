import type { Accessor, JSX } from "solid-js"
import type {
  Edge,
  GridStructure,
  Occupancy,
  RegisteredSurface,
  Reveal,
  Span,
  SurfaceDescriptor,
  Visibility,
} from "./types"

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

// ─── SurfaceHandle ────────────────────────────────────────────────────────────

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
  axisPriority?: import("./types").AxisPriority
  /** Per-corner explicit overrides (highest priority). */
  corners?: import("./types").CornerOwners
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
  /** When false, disables built-in slide animation so a custom transition can be used. Default: true */
  animate?: boolean
  /** Controlled visibility — overrides reveal/responsive behavior when set. */
  visibility?: Visibility
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
  /** When false, disables built-in slide animation so a custom transition can be used. Default: true */
  animate?: boolean
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
  /** When false, disables built-in slide animation so a custom transition can be used. Default: true */
  animate?: boolean
  children?: JSX.Element
  class?: string
  style?: JSX.CSSProperties
  /** Callback that receives the SurfaceHandle after mount */
  ref?: (handle: SurfaceHandle) => void
  /** Callback that receives the root DOM element after mount */
  domRef?: (el: HTMLElement) => void
}
