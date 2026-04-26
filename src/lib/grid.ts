import type {
  AxisPriority,
  CornerOwners,
  Edge,
  RegisteredSurface,
  Span,
} from "./types"

/** Returns true for surfaces that occupy a reserved grid track. Shared by buildGridLayout and getGridStructure. */
export function isReservedActive(s: RegisteredSurface): boolean {
  return (
    (s.occupancy === "reserved" || s.occupancy === "visible-driven") &&
    !(s.occupancy === "visible-driven" && s.visibility === "hidden")
  )
}

export function trackSize(surface: RegisteredSurface | undefined): string {
  if (!surface) return "0px"
  if (surface.occupancy === "visible-driven" && surface.visibility === "hidden") return "0px"
  if (surface.occupancy === "none") return "0px"
  return surface.reservedSize ?? surface.actualSize
}

/**
 * Resolve which edge wins a corner cell given the two surfaces that intersect there.
 * hSurface is the horizontal-edge (top/bottom) surface; vSurface is the vertical-edge (left/right) surface.
 * Priority: corners prop > span (full beats inset) > axisPriority > lower order > horizontal default.
 */
export function resolveCorner(
  hSurface: RegisteredSurface | undefined,
  vSurface: RegisteredSurface | undefined,
  axisPriority: AxisPriority | undefined,
  cornerOverride: { edge: Edge; order?: number } | undefined
): Edge {
  if (cornerOverride) return cornerOverride.edge

  const hSpan: Span | undefined = hSurface?.span
  const vSpan: Span | undefined = vSurface?.span

  if (hSpan === "full" && vSpan === "inset") return hSurface!.edge
  if (vSpan === "full" && hSpan === "inset") return vSurface!.edge

  if (axisPriority === "horizontal") return hSurface?.edge ?? "top"
  if (axisPriority === "vertical") return vSurface?.edge ?? "left"

  const hOrder = hSurface?.order ?? 0
  const vOrder = vSurface?.order ?? 0
  if (hOrder < vOrder) return hSurface?.edge ?? "top"
  if (vOrder < hOrder) return vSurface?.edge ?? "left"

  return hSurface?.edge ?? "top"
}

export function buildGridLayout(
  surfaces: RegisteredSurface[],
  axisPriority: AxisPriority | undefined,
  corners: CornerOwners | undefined
): { areas: string; columns: string; rows: string } {
  const reserved = (edge: Edge) =>
    surfaces
      .filter((s) => s.edge === edge && isReservedActive(s))
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

  const matrix: string[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(".")
  )

  matrix[topCount][leftCount] = "ss-body"

  leftSurfaces.forEach((s, k) => {
    matrix[topCount][k] = `ss-left-${s.order}`
  })

  rightSurfaces.forEach((s, k) => {
    matrix[topCount][leftCount + 1 + (rightCount - 1 - k)] = `ss-right-${s.order}`
  })

  topSurfaces.forEach((s, k) => {
    matrix[k][leftCount] = `ss-top-${s.order}`
  })

  bottomSurfaces.forEach((s, k) => {
    matrix[topCount + 1 + (bottomCount - 1 - k)][leftCount] = `ss-bottom-${s.order}`
  })

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

  const colTracks = [
    ...leftSurfaces.map((s) => trackSize(s)),
    "1fr",
    ...[...rightSurfaces].reverse().map((s) => trackSize(s)),
  ]

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
