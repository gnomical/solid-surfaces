import { createMemo, JSX } from "solid-js"
import { LayoutProvider, useLayout } from "../../context/LayoutContext"
import styles from "./LayoutRoot.module.css"
import type { LayoutRootProps, RegisteredSurface } from "../../lib/types"

// ─── Grid computation ─────────────────────────────────────────────────────────

/**
 * Compute CSS grid template columns from registered surfaces.
 * Order: left surfaces (ascending order) → 1fr main → right surfaces (descending order)
 */
function computeColumns(surfaces: RegisteredSurface[]): string {
  const left = surfaces
    .filter((s) => s.edge === "left" && s.occupancy === "reserved")
    .filter((s) => s.visibility === "visible" || s.occupancy !== "visible-driven")
    .sort((a, b) => a.order - b.order)

  const right = surfaces
    .filter((s) => s.edge === "right" && s.occupancy === "reserved")
    .filter((s) => s.visibility === "visible" || s.occupancy !== "visible-driven")
    .sort((a, b) => a.order - b.order)

  const leftCols = left.map((s) =>
    s.occupancy === "visible-driven" && s.visibility === "hidden" ? "0px" : s.size
  )
  const rightCols = right.map((s) =>
    s.occupancy === "visible-driven" && s.visibility === "hidden" ? "0px" : s.size
  )

  return [...leftCols, "1fr", ...rightCols].join(" ")
}

/**
 * Compute CSS grid template rows from registered surfaces.
 * Order: top surfaces (ascending order) → 1fr main → bottom surfaces (descending order)
 */
function computeRows(surfaces: RegisteredSurface[]): string {
  const top = surfaces
    .filter((s) => s.edge === "top" && s.occupancy === "reserved")
    .sort((a, b) => a.order - b.order)

  const bottom = surfaces
    .filter((s) => s.edge === "bottom" && s.occupancy === "reserved")
    .sort((a, b) => a.order - b.order)

  const topRows = top.map((s) =>
    s.occupancy === "visible-driven" && s.visibility === "hidden" ? "0px" : s.size
  )
  const bottomRows = bottom.map((s) =>
    s.occupancy === "visible-driven" && s.visibility === "hidden" ? "0px" : s.size
  )

  return [...topRows, "1fr", ...bottomRows].join(" ")
}

// ─── Inner component (has access to context) ──────────────────────────────────

function LayoutRootInner(props: LayoutRootProps) {
  const { surfaces } = useLayout()

  const gridTemplateColumns = createMemo(() => computeColumns(surfaces()))
  const gridTemplateRows = createMemo(() => computeRows(surfaces()))

  const gridStyle = createMemo<JSX.CSSProperties>(() => ({
    "grid-template-columns": gridTemplateColumns(),
    "grid-template-rows": gridTemplateRows(),
    ...props.style,
  }))

  return (
    <div
      class={`${styles.root}${props.class ? ` ${props.class}` : ""}`}
      style={gridStyle()}
    >
      {props.children}
    </div>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────

export function LayoutRoot(props: LayoutRootProps) {
  return (
    <LayoutProvider>
      <LayoutRootInner {...props} />
    </LayoutProvider>
  )
}
