import { createMemo, JSX } from "solid-js"
import { LayoutProvider, useLayout } from "../../context/LayoutContext"
import styles from "./LayoutRoot.module.css"
import type { Edge, LayoutRootProps, RegisteredSurface } from "../../lib/types"

// ─── Grid computation ─────────────────────────────────────────────────────────

function gridTrackSize(surfaces: RegisteredSurface[], edge: Edge): string {
  const s = surfaces.find(
    (s) => s.edge === edge && (s.occupancy === "reserved" || s.occupancy === "visible-driven")
  )
  if (!s) return "0px"
  if (s.occupancy === "visible-driven" && s.visibility === "hidden") return "0px"
  return s.reservedSize ?? s.actualSize
}

// ─── Inner component (has access to context) ──────────────────────────────────

function LayoutRootInner(props: LayoutRootProps) {
  const { surfaces } = useLayout()

  const gridStyle = createMemo<JSX.CSSProperties>(() => ({
    ...props.style,
    "grid-template-columns": `${gridTrackSize(surfaces(), "left")} 1fr ${gridTrackSize(surfaces(), "right")}`,
    "grid-template-rows": `${gridTrackSize(surfaces(), "top")} 1fr ${gridTrackSize(surfaces(), "bottom")}`,
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
