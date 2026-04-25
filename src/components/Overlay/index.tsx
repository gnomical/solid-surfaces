import type { OverlayProps } from "../../lib/types"
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
      class={props.class}
      style={props.style}
    >
      {props.children}
    </Surface>
  )
}
