import type { OverlayProps } from "../../lib/solid-types"
import { Surface } from "../Surface"

export function Overlay(props: OverlayProps) {
  return (
    <Surface
      edge={props.edge}
      overlay
      occupancy="none"
      reveal="manual"
      visibility={props.open ? "visible" : "hidden"}
      order={props.order ?? 0}
      span={props.span}
      zIndex={20}
      surfaceType="overlay"
      animate={props.animate}
      class={props.class}
      style={props.style}
    >
      {props.children}
    </Surface>
  )
}
