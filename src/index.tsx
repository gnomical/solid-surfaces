export { LayoutRoot } from "./components/LayoutRoot"
export { Body } from "./components/Body"
export { Surface } from "./components/Surface"
export { Rail } from "./components/Rail"
export { Overlay } from "./components/Overlay"
export { createSurface, useLayout } from "./context/LayoutContext"

export type {
  Edge,
  Occupancy,
  Visibility,
  Reveal,
  Span,
  AxisPriority,
  CornerOwners,
  GridStructure,
  SurfaceDescriptor,
  RegisteredSurface,
  CreateSurfaceOptions,
} from "./lib/types"

export type {
  LayoutContextValue,
  SurfaceHandle,
  LayoutRootProps,
  BodyProps,
  SurfaceProps,
  RailProps,
  OverlayProps,
} from "./lib/solid-types"
