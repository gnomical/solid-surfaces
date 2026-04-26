// ─── Edge model ──────────────────────────────────────────────────────────────

export type Edge = "left" | "right" | "top" | "bottom"

export type Occupancy = "none" | "reserved" | "visible-driven"

export type Visibility = "visible" | "hidden"

export type Reveal = "always" | "scroll-toward" | "pointer-proximity" | "manual"

export type Span = "full" | "inset"

export type AxisPriority = "horizontal" | "vertical"

export type CornerOwners = {
  topLeft?: { edge: Edge }
  topRight?: { edge: Edge }
  bottomLeft?: { edge: Edge }
  bottomRight?: { edge: Edge }
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

// ─── createSurface options ────────────────────────────────────────────────────

export type CreateSurfaceOptions = {
  edge: Edge
  occupancy?: Occupancy
  visibility?: Visibility
  reveal?: Reveal
  order?: number
  span?: Span
}
