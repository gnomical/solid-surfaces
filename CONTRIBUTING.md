# Contributing

## Codebase overview

solid-surfaces is a headless layout system. The code is split into two layers: a framework-agnostic core and a thin Solid.js adapter on top of it.

### The two layers

**Core — `src/lib/`**

These files have zero framework dependencies and can be read, tested, and reasoned about in plain TypeScript:

| File | What it does |
|---|---|
| `types.ts` | All domain types: `Edge`, `SurfaceDescriptor`, `RegisteredSurface`, `GridStructure`, etc. |
| `constants.ts` | `DEFAULT_BREAKPOINT`, `POINTER_PROXIMITY_THRESHOLD` |
| `grid.ts` | `buildGridLayout()` — pure function; takes a surfaces array and returns CSS grid template strings |
| `SurfacesController.ts` | Plain class; holds the surfaces array and scroll container, notifies subscribers on mutation |
| `RailController.ts` | Plain class; encapsulates the three reveal behaviors (scroll-toward, pointer-proximity, responsive breakpoint) behind a `connect()`/`disconnect()` interface |

If you are working on layout computation, reveal behavior logic, or the surface registration model, you are working here.

**Solid adapter — `src/context/`, `src/components/`, `src/lib/solid-types.ts`**

These files wrap the core in Solid.js primitives:

| File | What it does |
|---|---|
| `lib/solid-types.ts` | Solid-specific types: `LayoutContextValue`, `SurfaceHandle`, all component prop types (use `Accessor<T>`, `JSX.Element`) |
| `context/LayoutContext.tsx` | Instantiates `SurfacesController`; bridges it into Solid context via a tick signal so `createMemo` and other reactive computations re-run on mutations |
| `components/LayoutRoot/` | Calls `buildGridLayout` inside `createMemo`; renders the CSS grid container |
| `components/Rail/` | Instantiates `RailController` in `onMount`; wires Solid effects for actualSize and scrollContainer change notifications |
| `components/Surface/` | Calls `createSurface`; sets up ResizeObserver to measure content and drive grid track sizes |
| `components/Body/` | Sets `scrollContainer` on mount so scroll-toward reveal has something to listen to |
| `components/Overlay/` | Maps the `open` prop to `visibility` and renders a `Surface` in overlay mode |

If you are working on component API, Solid reactivity, or DOM wiring, you are working here.

---

## Key contracts between layers

**`SurfacesController` subscriber pattern**

The controller holds plain mutable state. It does not know about signals. Any code that wants to react to state changes must call `ctrl.subscribe(fn)` and read from `ctrl.getSurfaces()` / `ctrl.getGridStructure()` / `ctrl.getScrollContainer()` inside `fn`. The Solid adapter does this by incrementing a tick signal in the subscriber, which invalidates `createMemo` computations.

**`RailController.connect()` / `.disconnect()`**

`connect(surfaceEl)` attaches all event listeners and starts any animation loops. `disconnect()` tears them all down. These map directly to `onMount` / `onCleanup` in the Solid adapter. The controller itself never touches the DOM before `connect()` is called.

**`RailController.notifyActualSizeChanged()`**

The scroll-toward behavior needs to know when the surface's measured size changes mid-scroll so it can keep `reservedSize` in sync. The controller is passive — it does not observe `actualSize` itself. The Solid adapter calls `ctrl.notifyActualSizeChanged()` from a `createEffect` that reads `handle.actualSize()`. If you add a new adapter (React, Vue), you must wire this notification explicitly.

**`RailController.notifyScrollContainerChanged()`**

Similarly, when the scroll container element changes (e.g. `Body` mounts after `Rail`), the controller must be told so it can detach from the old container and attach to the new one. The Solid adapter does this in a `createEffect` that reads `scrollContainer()`.

---

## Running the demo

```sh
pnpm install
cd demo && pnpm run dev
```

The demo exercises all the main behaviors: scroll-toward reveal, pointer-proximity reveal, responsive mode switching, overlays, and axis priority / corner configuration.

---

## Adding a new framework adapter

The core layer is designed to be consumed by any framework. See [FRAMEWORK-AGNOSTIC.md](FRAMEWORK-AGNOSTIC.md) for a full plan including directory structure, build config, and a React adapter sketch.

The short version: instantiate `SurfacesController`, subscribe to it and bridge the notifications into your framework's reactive primitives, instantiate `RailController` in component mount/unmount lifecycle hooks, and wire `notifyActualSizeChanged` and `notifyScrollContainerChanged` from reactive effects.

---

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
