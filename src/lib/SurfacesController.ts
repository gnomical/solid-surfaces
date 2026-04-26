import { isReservedActive } from "./grid"
import type {
  GridStructure,
  RegisteredSurface,
  SurfaceDescriptor,
} from "./types"

let idCounter = 0

export class SurfacesController {
  private _surfaces: RegisteredSurface[] = []
  private _scrollContainer: HTMLElement | null = null
  private listeners = new Set<() => void>()

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  private notify() {
    for (const fn of this.listeners) fn()
  }

  getSurfaces(): RegisteredSurface[] {
    return this._surfaces
  }

  getScrollContainer(): HTMLElement | null {
    return this._scrollContainer
  }

  getGridStructure(): GridStructure {
    const active = this._surfaces.filter(isReservedActive)
    const count = (edge: RegisteredSurface["edge"]) =>
      active.filter((s) => s.edge === edge).length
    return {
      topCount: count("top"),
      bottomCount: count("bottom"),
      leftCount: count("left"),
      rightCount: count("right"),
    }
  }

  registerSurface(descriptor: SurfaceDescriptor): string {
    const id = `ss-surface-${++idCounter}`
    this._surfaces = [...this._surfaces, { ...descriptor, id }]
    this.notify()
    return id
  }

  unregisterSurface(id: string): void {
    this._surfaces = this._surfaces.filter((s) => s.id !== id)
    this.notify()
  }

  updateSurface(id: string, updates: Partial<SurfaceDescriptor>): void {
    this._surfaces = this._surfaces.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    )
    this.notify()
  }

  setScrollContainer(el: HTMLElement | null): void {
    this._scrollContainer = el
    this.notify()
  }
}
