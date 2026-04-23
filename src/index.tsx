export { LayoutRoot } from "./components/LayoutRoot"
export { Body } from "./components/Body"
export { Surface } from "./components/Surface"
export { Rail } from "./components/Rail"
export { Drawer } from "./components/Drawer"
export { createSurface, useLayout } from "./context/LayoutContext"

export type {
  Edge,
  Occupancy,
  Visibility,
  Reveal,
  SurfaceDescriptor,
  RegisteredSurface,
  LayoutContextValue,
  CreateSurfaceOptions,
  SurfaceHandle,
  LayoutRootProps,
  BodyProps,
  SurfaceProps,
  RailProps,
  DrawerProps,
} from "./lib/types"
