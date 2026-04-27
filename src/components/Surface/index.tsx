import { createEffect, onCleanup, onMount, JSX } from "solid-js"
import { createSurface, useLayout } from "../../context/LayoutContext"
import type { SurfaceProps } from "../../lib/types"
import styles from "./Surface.module.css"

export function Surface(props: SurfaceProps) {
  const { gridStructure } = useLayout()

  const handle = createSurface({
    edge: props.edge,
    occupancy: props.occupancy ?? (props.overlay ? "none" : "reserved"),
    reveal: props.reveal ?? "always",
    visibility: props.visibility ?? "visible",
    order: props.order ?? 0,
    span: props.span,
  })

  // Deliver handle synchronously so callers can wire effects against it
  props.ref?.(handle)

  // Reactively sync controlled visibility prop
  createEffect(() => {
    if (props.visibility !== undefined) handle.setVisibility(props.visibility)
  })

  const isHidden = () => handle.visibility() === "hidden"

  const inlineStyle = (): JSX.CSSProperties => {
    if (props.overlay) {
      const span = props.span ?? "full"
      const gs = gridStructure()
      // Grid placement constrains the absolute-positioned overlay's containing block.
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
      "grid-area": `ss-${props.edge}-${props.order ?? 0}`,
      ...props.style,
    }
  }

  let surfaceEl!: HTMLElement

  onMount(() => {
    const axis = props.edge === "left" || props.edge === "right" ? "width" : "height"
    const roAxis = props.edge === "left" || props.edge === "right" ? "inlineSize" : "blockSize"

    // For reserved surfaces, the grid cell is sized by the track (which starts at 0px),
    // so we observe the first child element — the caller's content — which carries the
    // real CSS size (e.g. width: 220px) independent of the grid track.
    // Overlay surfaces are absolutely positioned and size themselves, so we observe them directly.
    const target = props.overlay ? surfaceEl : (surfaceEl.firstElementChild as HTMLElement | null) ?? surfaceEl

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const size = entry.borderBoxSize?.[0]?.[roAxis] ?? entry.contentRect[axis]
        if (size > 0) handle.setActualSize(`${size}px`)
      }
    })
    ro.observe(target, { box: "border-box" })
    onCleanup(() => ro.disconnect())
  })

  return (
    <div
      ref={(el) => { surfaceEl = el; props.domRef?.(el) }}
      class={props.class}
      classList={{
        [styles.surface]: !props.overlay,
        [styles.overlay]: !!props.overlay,
        [styles.hidden]: isHidden(),
      }}
      style={inlineStyle()}
      data-ss-surface={props.surfaceType ?? "surface"}
      data-ss-edge={props.edge}
      data-ss-state={handle.visibility()}
    >
      {props.children}
    </div>
  )
}
