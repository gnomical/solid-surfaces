import {
  createContext,
  createMemo,
  createSignal,
  JSX,
  onCleanup,
  useContext,
} from "solid-js"
import { SurfacesController } from "../lib/SurfacesController"
import type {
  CreateSurfaceOptions,
  SurfaceDescriptor,
  Visibility,
} from "../lib/types"
import type { LayoutContextValue, SurfaceHandle } from "../lib/solid-types"


// ─── Context ──────────────────────────────────────────────────────────────────

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined)

export function LayoutProvider(props: { children: JSX.Element }) {
  const ctrl = new SurfacesController()

  // Bridge controller notifications into a Solid tick signal so createMemo
  // and other reactive computations re-run when controller state changes.
  const [tick, setTick] = createSignal(0)
  onCleanup(ctrl.subscribe(() => setTick((t) => t + 1)))

  const surfaces = createMemo(() => { tick(); return ctrl.getSurfaces() })
  const scrollContainer = createMemo(() => { tick(); return ctrl.getScrollContainer() })
  const gridStructure = createMemo(() => { tick(); return ctrl.getGridStructure() })

  return (
    <LayoutContext.Provider value={{
      surfaces,
      registerSurface: (d) => ctrl.registerSurface(d),
      unregisterSurface: (id) => ctrl.unregisterSurface(id),
      updateSurface: (id, updates) => ctrl.updateSurface(id, updates),
      scrollContainer,
      setScrollContainer: (el) => ctrl.setScrollContainer(el),
      gridStructure,
    }}>
      {props.children}
    </LayoutContext.Provider>
  )
}

// ─── useLayout ────────────────────────────────────────────────────────────────

export function useLayout(): LayoutContextValue {
  const ctx = useContext(LayoutContext)
  if (ctx === undefined) {
    throw new Error("useLayout must be called inside a LayoutRoot")
  }
  return ctx
}

// ─── createSurface ────────────────────────────────────────────────────────────

export function createSurface(options: CreateSurfaceOptions): SurfaceHandle {
  const ctx = useLayout()

  const descriptor: SurfaceDescriptor = {
    edge: options.edge,
    occupancy: options.occupancy ?? "reserved",
    visibility: options.visibility ?? "visible",
    reveal: options.reveal ?? "always",
    actualSize: "0px",
    order: options.order ?? 0,
    span: options.span,
  }

  const [visibility, setVisibilitySignal] = createSignal<Visibility>(descriptor.visibility)
  const [actualSize, setActualSizeSignal] = createSignal<string>("0px")

  let id: string

  function setVisibility(v: Visibility) {
    setVisibilitySignal(v)
    ctx.updateSurface(id, { visibility: v })
  }

  function setActualSize(v: string) {
    setActualSizeSignal(v)
    ctx.updateSurface(id, { actualSize: v })
  }

  id = ctx.registerSurface(descriptor)
  onCleanup(() => ctx.unregisterSurface(id))

  const surface = () => ctx.surfaces().find((s) => s.id === id)

  return { get id() { return id }, visibility, setVisibility, actualSize, setActualSize, surface }
}
