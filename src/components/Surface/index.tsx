import { createEffect, onCleanup, onMount, JSX } from "solid-js"
import { createSurface, useLayout } from "../../context/LayoutContext"
import { SlideController } from "../../lib/SlideController"
import { areaName } from "../../lib/grid"
import type { SurfaceProps } from "../../lib/solid-types"
import styles from "./Surface.module.css"

export function Surface(props: SurfaceProps) {
  const { gridStructure, updateSurface } = useLayout()

  const handle = createSurface({
    edge: props.edge,
    occupancy: props.occupancy ?? (props.overlay ? "none" : "reserved"),
    reveal: props.reveal ?? "always",
    visibility: props.visibility ?? "visible",
    order: props.order ?? 0,
    span: props.span ?? "full",
  })

  // Deliver handle synchronously so callers can wire effects against it
  props.ref?.(handle)

  // Reactively sync controlled visibility prop.
  // When animate is on, the SlideController intercepts (see onMount).
  createEffect(() => {
    if (props.visibility !== undefined && props.animate === false) {
      handle.setVisibility(props.visibility)
    }
  })

  const isHidden = () => handle.visibility() === "hidden"

  const inlineStyle = (): JSX.CSSProperties => {
    if (props.overlay) {
      const span = props.span ?? "full"
      const gs = gridStructure()
      // Grid placement positions the overlay as a grid item that self-aligns to fill its cell.
      // "full" covers all tracks; "inset" excludes crossing-axis rail tracks.
      const gridRow =
        span === "inset" && (props.edge === "left" || props.edge === "right")
          ? `${gs.topCount + 1} / ${gs.topCount + 2}`
          : `1 / -1`
      const gridCol =
        span === "inset" && (props.edge === "top" || props.edge === "bottom")
          ? `${gs.leftCount + 1} / ${gs.leftCount + 2}`
          : `1 / -1`
      return {
        "z-index": props.zIndex ?? 10,
        "grid-row": gridRow,
        "grid-column": gridCol,
        ...props.style,
      }
    }
    return {
      "grid-area": areaName({ id: handle.id, edge: props.edge, order: props.order ?? 0 }),
      ...props.style,
    }
  }

  let surfaceEl!: HTMLElement
  let animWrapperEl!: HTMLDivElement

  onMount(() => {
    const axis = props.edge === "left" || props.edge === "right" ? "width" : "height"
    const roAxis = props.edge === "left" || props.edge === "right" ? "inlineSize" : "blockSize"

    // For reserved surfaces, the grid cell is sized by the track (which starts at 0px),
    // so we observe the caller's content element — it carries the real CSS size
    // (e.g. width: 220px) independent of the grid track.
    // Overlay surfaces are grid items that size themselves, so we observe them directly.
    const target = props.overlay ? surfaceEl : (animWrapperEl.firstElementChild as HTMLElement | null) ?? surfaceEl

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const size = entry.borderBoxSize?.[0]?.[roAxis] ?? entry.contentRect[axis]
        if (size > 0) handle.setActualSize(`${size}px`)
      }
    })
    ro.observe(target, { box: "border-box" })
    onCleanup(() => ro.disconnect())

    if (props.animate === false) return

    // ── Slide animation ────────────────────────────────────────────────────────

    const applyTransform = (offset: number | null) => {
      if (offset === null || offset === 0) {
        animWrapperEl.style.transform = ""
        return
      }
      const translateAxis = props.edge === "left" || props.edge === "right" ? "X" : "Y"
      // Slide toward the docked edge: left/top slide negative, right/bottom slide positive
      const sign = props.edge === "left" || props.edge === "top" ? -1 : 1
      animWrapperEl.style.transform = `translate${translateAxis}(${sign * offset}px)`
    }

    const ctrl = new SlideController({
      edge: props.edge,
      getActualSize: () => parseFloat(handle.actualSize()) || 0,
      onReservedSizeChange: (size) => updateSurface(handle.id, { reservedSize: size }),
      onVisibilityChange: (v) => handle.setVisibility(v),
      onTransformChange: applyTransform,
    }, handle.visibility())

    onCleanup(() => ctrl.disconnect())

    // Intercept the controlled-prop path for animation.
    // External callers (RailController scroll-toward, pointer-proximity, responsive)
    // drive their own transitions and are not intercepted — they snap normally.
    // Track desired state separately — handle.visibility() stays "visible" during
    // a hide animation (so the element remains in the DOM), which would fool a naive
    // comparison and cause the effect to bail out prematurely on rapid toggles.
    let desired = handle.visibility()
    createEffect(() => {
      if (props.visibility === undefined) return
      const next = props.visibility
      if (next === desired) return
      desired = next
      if (next === "visible") {
        // Only pin track to 0 when fully at rest hidden — mid-animation the controller
        // already holds the correct partial reservedSize, resetting it would cause a snap
        if (ctrl.isAtRest) updateSurface(handle.id, { reservedSize: "0px" })
        handle.setVisibility("visible")
        ctrl.show()
      } else {
        ctrl.hide()
      }
    })
  })

  return (
    <div
      ref={(el) => { surfaceEl = el; props.domRef?.(el) }}
      class={props.class}
      classList={{
        [styles.surface]: true,
        [styles.overlay]: !!props.overlay,
        [styles.hidden]: isHidden(),
      }}
      style={inlineStyle()}
      data-ss-surface={props.surfaceType ?? "surface"}
      data-ss-edge={props.edge}
      data-ss-state={handle.visibility()}
    >
      <div ref={(el) => { animWrapperEl = el; props.animRef?.(el) }}>
        {props.children}
      </div>
    </div>
  )
}
