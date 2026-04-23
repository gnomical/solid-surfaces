import type { Accessor, JSX } from "solid-js"

// ─── Edge model ──────────────────────────────────────────────────────────────

export type Edge = "left" | "right" | "top" | "bottom"

export type Occupancy = "none" | "reserved" | "visible-driven"

export type Visibility = "visible" | "hidden"

export type Reveal = "always" | "scroll-toward" | "pointer-proximity" | "manual"

// ─── Surface descriptor ───────────────────────────────────────────────────────

export type SurfaceDescriptor = {
  edge: Edge
  occupancy: Occupancy
  visibility: Visibility
  reveal: Reveal
  /** Size along the surface's axis (CSS string, e.g. "240px", "20rem"). */
  size: string
  /** Stacking order among surfaces on the same edge. Lower = closer to center. */
  order: number
}

export type RegisteredSurface = SurfaceDescriptor & { id: string }

// ─── Context ──────────────────────────────────────────────────────────────────

export type LayoutContextValue = {
  surfaces: Accessor<RegisteredSurface[]>
  registerSurface: (descriptor: SurfaceDescriptor) => string
  unregisterSurface: (id: string) => void
  updateSurface: (id: string, updates: Partial<SurfaceDescriptor>) => void
}

// ─── createSurface ────────────────────────────────────────────────────────────

export type CreateSurfaceOptions = {
  edge: Edge
  occupancy?: Occupancy
  visibility?: Visibility
  reveal?: Reveal
  size?: string
  order?: number
}

export type SurfaceHandle = {
  id: string
  visibility: Accessor<Visibility>
  setVisibility: (v: Visibility) => void
  surface: Accessor<RegisteredSurface | undefined>
}

// ─── Component props ──────────────────────────────────────────────────────────

export type LayoutRootProps = {
  children?: JSX.Element
  class?: string
  style?: JSX.CSSProperties
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
  /** Size along the surface's axis. Default: "240px" */
  size?: string
  /** Stacking order among same-edge surfaces. Default: 0 */
  order?: number
  class?: string
  style?: JSX.CSSProperties
}

export type DrawerProps = {
  edge: Edge
  open: boolean
  children?: JSX.Element
  /** Size along the surface's axis. Default: "300px" */
  size?: string
  /** Stacking order among same-edge surfaces. Default: 0 */
  order?: number
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
  size: string
  order?: number
  /** z-index for overlay mode. Default: 10 */
  zIndex?: number
  /** Value for data-ss-surface attribute. Default: "surface" */
  surfaceType?: string
  children?: JSX.Element
  class?: string
  style?: JSX.CSSProperties
  /** Callback that receives the SurfaceHandle after mount */
  ref?: (handle: SurfaceHandle) => void
}
