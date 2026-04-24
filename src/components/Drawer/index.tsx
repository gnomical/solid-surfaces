import type { DrawerProps } from "../../lib/types"
import { Surface } from "../Surface"

export function Drawer(props: DrawerProps) {
  return (
    <Surface
      edge={props.edge}
      overlay
      occupancy="none"
      reveal="manual"
      visibility={props.open ? "visible" : "hidden"}
      order={props.order ?? 0}
      zIndex={20}
      surfaceType="drawer"
      class={props.class}
      style={props.style}
    >
      {props.children}
    </Surface>
  )
}
