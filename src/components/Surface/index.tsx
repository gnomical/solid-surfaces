import { createEffect, JSX } from "solid-js"
import { createSurface } from "../../context/LayoutContext"
import type { SurfaceProps } from "../../lib/types"
import styles from "./Surface.module.css"

function sizeStyle(edge: SurfaceProps["edge"], size: string): JSX.CSSProperties {
  const horizontal = edge === "left" || edge === "right"
  return horizontal ? { width: size } : { height: size }
}

export function Surface(props: SurfaceProps) {
  const handle = createSurface({
    edge: props.edge,
    occupancy: props.occupancy ?? (props.overlay ? "none" : "reserved"),
    reveal: props.reveal ?? "always",
    visibility: props.visibility ?? "visible",
    size: props.size,
    order: props.order ?? 0,
  })

  // Deliver handle synchronously so callers can wire effects against it
  props.ref?.(handle)

  // Reactively sync controlled visibility prop
  createEffect(() => {
    if (props.visibility !== undefined) handle.setVisibility(props.visibility)
  })

  const isHidden = () => handle.visibility() === "hidden"

  const inlineStyle = (): JSX.CSSProperties => ({
    ...(props.overlay
      ? { ...sizeStyle(props.edge, props.size), "z-index": props.zIndex ?? 10 }
      : { "grid-area": props.edge }),
    ...props.style,
  })

  return (
    <div
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
