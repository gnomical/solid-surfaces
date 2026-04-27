# Framework-Agnostic Refactor — Phase 2 Plan

Stage 1 (internal extraction) is complete. All core logic now lives in framework-agnostic files with zero Solid.js imports. Stage 2 is the monorepo split: moving those files into a separate `packages/core` package that can be consumed by any framework adapter.

**Only do Stage 2 when there is a concrete second framework consumer (React, Vue, etc.).** The build plumbing adds real maintenance overhead; don't pay that cost speculatively.

---

## Current state after Stage 1

```
src/
  lib/
    grid.ts               ← pure: buildGridLayout, resolveCorner, trackSize
    SurfacesController.ts ← pure: subscriber-pattern store for surfaces + scroll container
    RailController.ts     ← pure: scroll-toward, pointer-proximity, responsive breakpoint
    types.ts              ← pure: all domain types (Edge, SurfaceDescriptor, etc.)
    constants.ts          ← pure: DEFAULT_BREAKPOINT, POINTER_PROXIMITY_THRESHOLD
    solid-types.ts        ← Solid-specific: LayoutContextValue, SurfaceHandle, component props
  context/
    LayoutContext.tsx     ← thin Solid bridge over SurfacesController
  components/
    LayoutRoot/           ← thin Solid component, calls buildGridLayout inside createMemo
    Rail/                 ← thin Solid component, instantiates RailController in onMount
    Surface/              ← Solid component (ResizeObserver + createSurface)
    Body/                 ← Solid component (sets scrollContainer on mount)
    Overlay/              ← Solid component (maps open prop to visibility)
```

---

## Stage 2: Monorepo split

### Directory structure

```
packages/
  core/
    src/
      SurfacesController.ts
      RailController.ts
      grid.ts
      types.ts
      constants.ts
    package.json
    tsconfig.json
    vite.config.ts        (or tsup.config.ts — no JSX, plain ESM)
  solid/
    src/
      lib/
        solid-types.ts
      context/
        LayoutContext.tsx
      components/
        LayoutRoot/
        Rail/
        Surface/
        Body/
        Overlay/
      index.tsx
    package.json
    tsconfig.json
    vite.config.ts
demo/
  ...                     (unchanged source; dependency path updates only)
pnpm-workspace.yaml       (add packages/core and packages/solid entries)
```

### Package names

| Package | Name | Peer deps |
|---|---|---|
| `packages/core` | `@solid-surfaces/core` | none |
| `packages/solid` | `@solid-surfaces/solid` | `solid-js ^1.9.0` |

### Build config changes

**`packages/core`** — plain TypeScript, no JSX:
- `tsconfig.json`: no `jsxImportSource`, `"moduleResolution": "bundler"`, `"module": "ESNext"`
- `vite.config.ts` (or tsup): standard library build, entry `src/index.ts`, output ESM + CJS + `.d.ts`
- No CSS, no `vite-plugin-lib-inject-css`

**`packages/solid`** — same as the current root `vite.config.ts`:
- `tsconfig.json`: keep `"jsxImportSource": "solid-js"`, `"jsx": "preserve"`
- `vite.config.ts`: keep `esbuild: { jsx: "preserve" }`, `vite-plugin-lib-inject-css`
- Add `"@solid-surfaces/core": "workspace:*"` as a dependency

**`pnpm-workspace.yaml`**:
```yaml
packages:
  - packages/*
  - demo
```

### Demo update

Only the `package.json` dependency changes:
```json
"dependencies": {
  "@solid-surfaces/solid": "workspace:*"
}
```

All import paths in `demo/src/` change from `"solid-surfaces"` to `"@solid-surfaces/solid"`. Source logic is unchanged.

### Adding a React adapter

Once `packages/core` exists, a React adapter is a new package `packages/react`:

```
packages/react/
  src/
    LayoutContext.tsx     ← useState + useEffect bridge over SurfacesController
    components/
      LayoutRoot.tsx      ← buildGridLayout inside useMemo
      Rail.tsx            ← RailController in useEffect, notifyScrollContainerChanged in useEffect dep
      Surface.tsx         ← ResizeObserver + useSyncExternalStore or useState
      Body.tsx
      Overlay.tsx
    index.ts
  package.json           ← peerDeps: react ^18, @solid-surfaces/core: workspace:*
```

The React bridge for `SurfacesController` uses `useSyncExternalStore`:
```ts
const surfaces = useSyncExternalStore(ctrl.subscribe.bind(ctrl), ctrl.getSurfaces.bind(ctrl))
```

`RailController.connect()` / `.disconnect()` map directly to `useEffect` cleanup.

### One wiring subtlety to remember

`RailController` for `scroll-toward` needs to be told when the scroll container changes. In the Solid adapter this is `createEffect(() => { void scrollContainer(); ctrl?.notifyScrollContainerChanged() })`. In React it is a `useEffect` with `[scrollContainer]` in the dependency array that calls `ctrl.notifyScrollContainerChanged()`. This explicit notification is required because the controller is passive — it does not observe the container reference itself.

---

## What does NOT change in Stage 2

- All logic inside `SurfacesController`, `RailController`, `buildGridLayout` — zero changes
- All domain types in `types.ts` — zero changes
- Demo source files — zero changes
- Public API surface of `@solid-surfaces/solid` — identical to current `solid-surfaces`
