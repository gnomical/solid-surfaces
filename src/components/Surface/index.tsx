import { createEffect, onCleanup, onMount, JSX } from "solid-js"
import { createSurface } from "../../context/LayoutContext"
import type { SurfaceProps } from "../../lib/types"
import styles from "./Surface.module.css"

export function Surface(props: SurfaceProps) {
  const handle = createSurface({
    edge: props.edge,
    occupancy: props.occupancy ?? (props.overlay ? "none" : "reserved"),
    reveal: props.reveal ?? "always",
    visibility: props.visibility ?? "visible",
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
      ? { "z-index": props.zIndex ?? 10 }
      : { "grid-area": props.edge }),
    ...props.style,
  })

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
