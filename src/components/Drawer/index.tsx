import { DEFAULT_DRAWER_SIZE } from "../../lib/constants"
import type { DrawerProps } from "../../lib/types"
import { Surface } from "../Surface"

export function Drawer(props: DrawerProps) {
  const size = () => props.size ?? DEFAULT_DRAWER_SIZE

  return (
    <Surface
      edge={props.edge}
      overlay
      occupancy="none"
      reveal="manual"
      visibility={props.open ? "visible" : "hidden"}
      size={size()}
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
