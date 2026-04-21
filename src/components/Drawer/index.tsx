import { createEffect, JSX } from "solid-js"
import { createSurface } from "../../context/LayoutContext"
import { DEFAULT_DRAWER_SIZE } from "../../lib/constants"
import type { DrawerProps, Edge } from "../../lib/types"
import styles from "./Drawer.module.css"

function sizeStyle(edge: Edge, size: string): JSX.CSSProperties {
  const horizontal = edge === "left" || edge === "right"
  return horizontal ? { width: size } : { height: size }
}

export function Drawer(props: DrawerProps) {
  const size = () => props.size ?? DEFAULT_DRAWER_SIZE

  const handle = createSurface({
    edge: props.edge,
    occupancy: "none",
    reveal: "manual",
    visibility: props.open ? "visible" : "hidden",
    size: size(),
    order: props.order ?? 0,
  })

  // Sync open prop → context visibility
  createEffect(() => {
    handle.setVisibility(props.open ? "visible" : "hidden")
  })

  const isHidden = () => handle.visibility() === "hidden"

  const inlineStyle = (): JSX.CSSProperties => ({
    ...sizeStyle(props.edge, size()),
    ...props.style,
  })

  return (
    <div
      class={`${styles.drawer}${props.class ? ` ${props.class}` : ""}`}
      classList={{ [styles.hidden]: isHidden() }}
      style={inlineStyle()}
      data-ss-surface="drawer"
      data-ss-edge={props.edge}
      data-ss-state={handle.visibility()}
    >
      {props.children}
    </div>
  )
}
