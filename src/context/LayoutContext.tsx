import {
  createContext,
  createSignal,
  onCleanup,
  onMount,
  useContext,
} from "solid-js"
import type {
  CreateSurfaceOptions,
  LayoutContextValue,
  RegisteredSurface,
  SurfaceDescriptor,
  SurfaceHandle,
  Visibility,
} from "../lib/types"

// ─── Context ──────────────────────────────────────────────────────────────────

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined)

let idCounter = 0

export function LayoutProvider(props: { children: any }) {
  const [surfaces, setSurfaces] = createSignal<RegisteredSurface[]>([])

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
    <LayoutContext.Provider value={{ surfaces, registerSurface, unregisterSurface, updateSurface }}>
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
    size: options.size ?? "240px",
    order: options.order ?? 0,
  }

  let id: string

  const [visibility, setVisibilitySignal] = createSignal<Visibility>(descriptor.visibility)

  function setVisibility(v: Visibility) {
    setVisibilitySignal(v)
    ctx.updateSurface(id, { visibility: v })
  }

  onMount(() => {
    id = ctx.registerSurface(descriptor)
    onCleanup(() => ctx.unregisterSurface(id))
  })

  const surface = () => ctx.surfaces().find((s) => s.id === id)

  return { get id() { return id }, visibility, setVisibility, surface }
}
