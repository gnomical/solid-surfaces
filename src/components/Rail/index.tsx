import {
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  type JSX,
} from "solid-js"
import { useLayout } from "../../context/LayoutContext"
import { DEFAULT_BREAKPOINT } from "../../lib/constants"
import { RailController } from "../../lib/RailController"
import type { Occupancy } from "../../lib/types"
import type { RailProps, SurfaceHandle } from "../../lib/solid-types"
import { Surface } from "../Surface"


export function Rail(props: RailProps) {
  const { updateSurface, scrollContainer } = useLayout()

  const reveal = () => props.reveal ?? "always"
  const breakpoint = () => props.breakpoint ?? DEFAULT_BREAKPOINT

  const [occupancy, setOccupancy] = createSignal<Occupancy>(props.occupancy ?? "reserved")
  const overlayMode = () => occupancy() === "none"

  const scrollStyle = (): JSX.CSSProperties => props.style ?? {}

  let handle!: SurfaceHandle
  let surfaceEl!: HTMLElement
  let animWrapperEl!: HTMLElement
  let ctrl: RailController

  // Sync occupancy changes back to context
  createEffect(() => {
    if (handle) updateSurface(handle.id, { occupancy: occupancy() })
  })

  onMount(() => {
    ctrl = new RailController({
      edge: props.edge,
      reveal: reveal(),
      responsive: props.responsive ?? false,
      breakpoint: breakpoint(),
      animate: props.animate !== false,
      getVisibility: () => handle.visibility(),
      getScrollContainer: () => scrollContainer(),
      getActualSize: () => parseFloat(handle.actualSize()) || 0,
      onVisibilityChange: (v) => {
        handle.setVisibility(v)
      },
      onReservedSizeChange: (size) => updateSurface(handle.id, { reservedSize: size }),
      onOccupancyChange: setOccupancy,
    })

    ctrl.connect(surfaceEl, animWrapperEl)
    onCleanup(() => ctrl.disconnect())
  })

  // Re-run commit when actualSize changes during a partial scroll-toward reveal
  // so reservedSize stays in sync. Only meaningful when mid-scroll (virtualPos > 0).
  createEffect(() => {
    void handle?.actualSize()
    ctrl?.notifyActualSizeChanged()
  })

  // Notify controller when the scroll container changes
  createEffect(() => {
    void scrollContainer()
    ctrl?.notifyScrollContainerChanged()
  })

  return (
    <Surface
      ref={(h: SurfaceHandle) => { handle = h }}
      domRef={(el: HTMLElement) => { surfaceEl = el }}
      animRef={(el: HTMLElement) => { animWrapperEl = el }}
      edge={props.edge}
      overlay={overlayMode()}
      occupancy={occupancy()}
      reveal={reveal()}
      visibility={props.visibility}
      order={props.order ?? 0}
      span={props.span}
      zIndex={10}
      surfaceType="rail"
      animate={props.animate}
      class={props.class}
      style={scrollStyle()}
    >
      {props.children}
    </Surface>
  )
}
