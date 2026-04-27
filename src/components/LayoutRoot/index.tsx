import { createMemo, JSX } from "solid-js"
import { LayoutProvider, useLayout } from "../../context/LayoutContext"
import styles from "./LayoutRoot.module.css"
import type {
  AxisPriority,
  CornerOwners,
  Edge,
  LayoutRootProps,
  RegisteredSurface,
  Span,
} from "../../lib/types"

// ─── Track size ───────────────────────────────────────────────────────────────

function trackSize(surface: RegisteredSurface | undefined): string {
  if (!surface) return "0px"
  if (surface.occupancy === "visible-driven" && surface.visibility === "hidden") return "0px"
  if (surface.occupancy === "none") return "0px"
  return surface.reservedSize ?? surface.actualSize
}

// ─── Corner resolution ────────────────────────────────────────────────────────

/**
 * Resolve which edge wins a corner cell given the two surfaces that intersect there.
 * hSurface is the horizontal-edge (top/bottom) surface; vSurface is the vertical-edge (left/right) surface.
 * Priority: corners prop > span (full beats inset) > axisPriority > lower order > horizontal default.
 */
function resolveCorner(
  hSurface: RegisteredSurface | undefined,
  vSurface: RegisteredSurface | undefined,
  axisPriority: AxisPriority | undefined,
  cornerOverride: { edge: Edge; order?: number } | undefined
): Edge {
  // Rule 1: explicit corners override
  if (cornerOverride) return cornerOverride.edge

  const hSpan: Span | undefined = hSurface?.span
  const vSpan: Span | undefined = vSurface?.span

  // Rule 2: full beats inset (one side declares, other yields)
  if (hSpan === "full" && vSpan === "inset") return hSurface!.edge
  if (vSpan === "full" && hSpan === "inset") return vSurface!.edge

  // Rule 3: axisPriority breaks ties between full/full, inset/inset, or neither
  if (axisPriority === "horizontal") return hSurface?.edge ?? "top"
  if (axisPriority === "vertical") return vSurface?.edge ?? "left"

  // Rule 4: no axisPriority — lower order (outermost) wins
  const hOrder = hSurface?.order ?? 0
  const vOrder = vSurface?.order ?? 0
  if (hOrder < vOrder) return hSurface?.edge ?? "top"
  if (vOrder < hOrder) return vSurface?.edge ?? "left"

  // Rule 5: tie — horizontal wins by default
  return hSurface?.edge ?? "top"
}

// ─── Grid template areas matrix ───────────────────────────────────────────────

function buildGridLayout(
  surfaces: RegisteredSurface[],
  axisPriority: AxisPriority | undefined,
  corners: CornerOwners | undefined
): { areas: string; columns: string; rows: string } {
  // Collect reserved surfaces per edge, sorted by order ascending (0 = outermost)
  const reserved = (edge: Edge) =>
    surfaces
      .filter(
        (s) =>
          s.edge === edge &&
          (s.occupancy === "reserved" || s.occupancy === "visible-driven") &&
          !(s.occupancy === "visible-driven" && s.visibility === "hidden")
      )
      .sort((a, b) => a.order - b.order)

  const leftSurfaces = reserved("left")
  const rightSurfaces = reserved("right")
  const topSurfaces = reserved("top")
  const bottomSurfaces = reserved("bottom")

  const leftCount = leftSurfaces.length
  const rightCount = rightSurfaces.length
  const topCount = topSurfaces.length
  const bottomCount = bottomSurfaces.length

  const cols = leftCount + 1 + rightCount
  const rows = topCount + 1 + bottomCount

  // Initialize matrix
  const matrix: string[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(".")
  )

  // Body cell
  matrix[topCount][leftCount] = "ss-body"

  // Left surfaces: col k (outermost order=0 = col 0, innermost = col leftCount-1)
  leftSurfaces.forEach((s, k) => {
    matrix[topCount][k] = `ss-left-${s.order}`
  })

  // Right surfaces: col leftCount+1+k reversed (outermost order=0 = last col)
  rightSurfaces.forEach((s, k) => {
    matrix[topCount][leftCount + 1 + (rightCount - 1 - k)] = `ss-right-${s.order}`
  })

  // Top surfaces: row k reversed (outermost order=0 = row 0)
  topSurfaces.forEach((s, k) => {
    matrix[k][leftCount] = `ss-top-${s.order}`
  })

  // Bottom surfaces: row topCount+1+k reversed (outermost order=0 = last row)
  bottomSurfaces.forEach((s, k) => {
    matrix[topCount + 1 + (bottomCount - 1 - k)][leftCount] = `ss-bottom-${s.order}`
  })

  // Corner cells — top-left quadrant
  // row r → topSurfaces[r] (r=0 = outermost top)
  // col c → leftSurfaces[c] (c=0 = outermost left)
  for (let r = 0; r < topCount; r++) {
    for (let c = 0; c < leftCount; c++) {
      const hSurface = topSurfaces[r]
      const vSurface = leftSurfaces[c]
      const override = r === 0 && c === 0 ? corners?.topLeft : undefined
      const winner = resolveCorner(hSurface, vSurface, axisPriority, override)
      const winnerSurface = winner === hSurface?.edge ? hSurface : vSurface
      matrix[r][c] = winnerSurface ? `ss-${winnerSurface.edge}-${winnerSurface.order}` : "."
    }
  }

  // Corner cells — top-right quadrant
  // row r → topSurfaces[r]
  // col leftCount+1+rk, rk=0 = innermost right; outermost right = last col (rk = rightCount-1)
  for (let r = 0; r < topCount; r++) {
    for (let c = leftCount + 1; c < cols; c++) {
      const rk = c - (leftCount + 1)
      const hSurface = topSurfaces[r]
      const vSurface = rightSurfaces[rightCount - 1 - rk]
      const override = r === 0 && c === cols - 1 ? corners?.topRight : undefined
      const winner = resolveCorner(hSurface, vSurface, axisPriority, override)
      const winnerSurface = winner === hSurface?.edge ? hSurface : vSurface
      matrix[r][c] = winnerSurface ? `ss-${winnerSurface.edge}-${winnerSurface.order}` : "."
    }
  }

  // Corner cells — bottom-left quadrant
  // row topCount+1+bk, bk=0 = innermost bottom; outermost bottom = last row (bk = bottomCount-1)
  // col c → leftSurfaces[c]
  for (let r = topCount + 1; r < rows; r++) {
    for (let c = 0; c < leftCount; c++) {
      const bk = r - (topCount + 1)
      const hSurface = bottomSurfaces[bottomCount - 1 - bk]
      const vSurface = leftSurfaces[c]
      const override = r === rows - 1 && c === 0 ? corners?.bottomLeft : undefined
      const winner = resolveCorner(hSurface, vSurface, axisPriority, override)
      const winnerSurface = winner === hSurface?.edge ? hSurface : vSurface
      matrix[r][c] = winnerSurface ? `ss-${winnerSurface.edge}-${winnerSurface.order}` : "."
    }
  }

  // Corner cells — bottom-right quadrant
  for (let r = topCount + 1; r < rows; r++) {
    for (let c = leftCount + 1; c < cols; c++) {
      const bk = r - (topCount + 1)
      const rk = c - (leftCount + 1)
      const hSurface = bottomSurfaces[bottomCount - 1 - bk]
      const vSurface = rightSurfaces[rightCount - 1 - rk]
      const override = r === rows - 1 && c === cols - 1 ? corners?.bottomRight : undefined
      const winner = resolveCorner(hSurface, vSurface, axisPriority, override)
      const winnerSurface = winner === hSurface?.edge ? hSurface : vSurface
      matrix[r][c] = winnerSurface ? `ss-${winnerSurface.edge}-${winnerSurface.order}` : "."
    }
  }

  const areas = matrix
    .map((row) => `"${row.join(" ")}"`)
    .join(" ")

  // Track sizes
  // Columns: left surfaces outermost→innermost, 1fr, right surfaces innermost→outermost
  // Columns: left outermost→innermost (order 0 first), 1fr, right innermost→outermost (order 0 last)
  const colTracks = [
    ...leftSurfaces.map((s) => trackSize(s)),
    "1fr",
    ...[...rightSurfaces].reverse().map((s) => trackSize(s)),
  ]

  // Rows: top outermost→innermost (order 0 first), 1fr, bottom innermost→outermost (order 0 last)
  const rowTracks = [
    ...topSurfaces.map((s) => trackSize(s)),
    "1fr",
    ...[...bottomSurfaces].reverse().map((s) => trackSize(s)),
  ]

  return {
    areas,
    columns: colTracks.join(" "),
    rows: rowTracks.join(" "),
  }
}

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
