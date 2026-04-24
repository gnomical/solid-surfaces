# solid-surfaces

> **Early concept exploration — pre-alpha.**
> The API and primitive shapes are in flux and may change significantly before any release.

A headless layout system for coordinating edge-attached surfaces in SolidJS.

Most UI libraries give you drawers, sidebars, and headers as isolated components. solid-surfaces introduces a unified model: layout is composed of surfaces that attach to edges and participate in shared space.

## What problem does this solve?

In real apps, layout is not static:

* a sidebar becomes a drawer on mobile
* a header hides on scroll and reappears on interaction
* an inspector panel overlays or pushes content depending on context
* multiple panels compete for the same edge

Most tools treat these as separate components. solid-surfaces treats them as the same thing.

## The model

Everything is a surface.

A surface is something that:

* attaches to an edge (left, right, top, bottom)
* may reserve or overlay space
* can appear, disappear, or reveal based on interaction
* participates in a shared layout

### Quick example

```tsx
import { LayoutRoot, Rail, Body, Drawer } from "solid-surfaces"

function App() {
  const [drawerOpen, setDrawerOpen] = createSignal(false)

  return (
    <LayoutRoot>
      <Rail edge="top" reveal="scroll-toward" size="60px">
        Top navigation
      </Rail>
      <Rail edge="left" responsive size="220px">
        Sidebar
      </Rail>
      <Body>
        Main content
      </Body>
      <Drawer edge="bottom" open={drawerOpen()} size="200px">
        Tray content
      </Drawer>
    </LayoutRoot>
  )
}
```

* The sidebar becomes an overlay below the responsive breakpoint
* The top rail hides as the user scrolls away and reveals as they scroll back
* The body adjusts based on active surfaces
* No manual layout math

## Core primitives

#### LayoutRoot

The layout engine. Wraps all surfaces and the body, computes CSS grid geometry reactively from registered surface descriptors, and provides layout context to descendants.

#### Rail

A persistent edge-attached panel.

```tsx
<Rail edge="left" />
<Rail edge="right" />
<Rail edge="top" />
<Rail edge="bottom" />
```

Supports three reveal behaviors:

* `reveal="always"` — always visible and reserved (default)
* `reveal="scroll-toward"` — hides as the user scrolls away, reveals as they scroll back; snaps to fully shown or hidden at rest
* `reveal="pointer-proximity"` — reveals when the pointer approaches the edge

Rails also support responsive switching: above a configurable `breakpoint` the rail reserves grid space; below it switches to overlay mode.

```tsx
<Rail edge="left" responsive breakpoint={768} size="220px" />
```

#### Body

The main content area. Automatically adjusts based on which surfaces are active and how much space they reserve.

#### Drawer

A transient overlay surface, controlled by an `open` prop. Does not affect the grid — it renders above reserved surfaces.

```tsx
<Drawer edge="bottom" open={open()} size="200px" />
```

## How it works

Each surface registers a descriptor with the layout engine:

```
edge:      "left" | "right" | "top" | "bottom"
occupancy: "none" | "reserved" | "visible-driven"
visibility: "visible" | "hidden"
reveal:    "always" | "scroll-toward" | "pointer-proximity" | "manual"
size:      string  // CSS value, e.g. "240px"
order:     number  // stacking among same-edge surfaces
```

`LayoutRoot` derives CSS grid track sizes reactively from these descriptors. When a surface registers, unregisters, changes occupancy, or changes size (e.g. during scroll-coupled shrinking), the grid updates automatically.

## Low-level usage

You can bypass the provided primitives and register a surface directly:

```tsx
import { createSurface } from "solid-surfaces"

const handle = createSurface({
  edge: "top",
  occupancy: "visible-driven",
  reveal: "scroll-toward",
  size: "60px",
})
```

This gives full control over reveal logic and occupancy transitions for custom behaviors.

## Design goals

* **Composable** — surfaces work together, not in isolation
* **Predictable** — layout is derived from explicit rules
* **Headless** — no styling or visual assumptions
* **Practical** — works for real app shells, not just demos

## Accessibility

This library does not manage ARIA roles, focus trapping, or keyboard interactions. Consumers are responsible for implementing accessible patterns appropriate to their use case.

## Status and roadmap

Currently exploring core concepts. Not ready for production use.

- [x] Layout engine (LayoutRoot + LayoutContext)
- [x] Rail primitive with scroll-toward, pointer-proximity, and responsive behaviors
- [x] Drawer primitive
- [x] Body primitive
- [x] Low-level `createSurface` escape hatch
- [ ] Dedicated Header primitive
- [ ] Multi-surface same-edge conflict resolution
- [ ] Accessibility helpers (optional, headless)
- [ ] Devtools / visualization

## Contributing

Contributions are welcome.

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
