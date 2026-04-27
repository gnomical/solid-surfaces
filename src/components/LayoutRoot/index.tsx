import { createMemo, JSX } from "solid-js"
import { LayoutProvider, useLayout } from "../../context/LayoutContext"
import { buildGridLayout } from "../../lib/grid"
import styles from "./LayoutRoot.module.css"
import type { LayoutRootProps } from "../../lib/solid-types"

// ─── Inner component (has access to context) ──────────────────────────────────

function LayoutRootInner(props: LayoutRootProps) {
  const { surfaces } = useLayout()

  const gridStyle = createMemo<JSX.CSSProperties>(() => {
    const { areas, columns, rows } = buildGridLayout(surfaces(), props.axisPriority, props.corners)
    return {
      ...props.style,
      "grid-template-areas": areas,
      "grid-template-columns": columns,
      "grid-template-rows": rows,
    }
  })

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
