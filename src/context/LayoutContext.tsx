import {
  createContext,
  createMemo,
  createSignal,
  JSX,
  onCleanup,
  useContext,
} from "solid-js"
import type {
  CreateSurfaceOptions,
  GridStructure,
  LayoutContextValue,
  RegisteredSurface,
  SurfaceDescriptor,
  SurfaceHandle,
  Visibility,
} from "../lib/types"


// ─── Context ──────────────────────────────────────────────────────────────────

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined)

let idCounter = 0

export function LayoutProvider(props: { children: JSX.Element }) {
  const [surfaces, setSurfaces] = createSignal<RegisteredSurface[]>([])
  const [scrollContainer, setScrollContainer] = createSignal<HTMLElement | null>(null)

  const gridStructure = createMemo<GridStructure>(() => {
    const active = surfaces().filter(
      (s) => s.occupancy === "reserved" || s.occupancy === "visible-driven"
    )
    const count = (edge: RegisteredSurface["edge"]) =>
      active.filter((s) => s.edge === edge).length
    return {
      topCount: count("top"),
      bottomCount: count("bottom"),
      leftCount: count("left"),
      rightCount: count("right"),
    }
  })

  function registerSurface(descriptor: SurfaceDescriptor): string {
    const id = `ss-surface-${++idCounter}`
    setSurfaces((prev) => [...prev, { ...descriptor, id }])
    return id
  }

  function unregisterSurface(id: string): void {
    setSurfaces((prev) => prev.filter((s) => s.id !== id))
  }

  function updateSurface(id: string, updates: Partial<SurfaceDescriptor>): void {
    setSurfaces((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    )
  }

  return (
    <LayoutContext.Provider value={{ surfaces, registerSurface, unregisterSurface, updateSurface, scrollContainer, setScrollContainer, gridStructure }}>
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

  let id: string

  const [visibility, setVisibilitySignal] = createSignal<Visibility>(descriptor.visibility)
  const [actualSize, setActualSizeSignal] = createSignal<string>("0px")

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
