# solid-surfaces

A headless layout system for coordinating edge-attached surfaces.

Most UI libraries give you drawers, sidebars, and headers as isolated components.

solid-surfaces introduces a unified model:

Layout is composed of surfaces that attach to edges and participate in shared space.

## What problem does this solve?

In real apps, layout is not static:

* a sidebar becomes a drawer on mobile
* a header hides on scroll and reappears on interaction
* an inspector panel overlays or pushes content depending on context
* multiple panels compete for the same edge

Most tools treat these as separate components.

solid-surfaces treats them as the same thing.

## The model

Everything is a surface.

A surface is something that:

* attaches to an edge (left, right, top, bottom)
* may reserve or overlay space
* can appear, disappear, or reveal based on interaction
* participates in a shared layout

### Quick example
```typescript
import {
  LayoutRoot,
  Header,
  Rail,
  Body
} from "solid-surfaces"
function App() {
  return (
    <LayoutRoot>
      <Header reveal="scroll-toward">
        Top navigation
      </Header>
      <Rail edge="left" responsive>
        Sidebar
      </Rail>
      <Body>
        Main content
      </Body>
    </LayoutRoot>
  )
}
```

That’s it.

* The sidebar becomes a drawer on small screens
* The header hides and reveals automatically
* The body adjusts based on active surfaces

No manual layout math.

## Core primitives

#### LayoutRoot

The layout engine.

* coordinates all surfaces
* computes layout participation
* renders structural regions

#### Header

A top-edge surface.

Supports:

* reveal="scroll-toward"
* reveal="pointer-proximity"
* reveal="always"

#### Rail

An edge-attached surface.

<Rail edge="left" />
<Rail edge="right" />

Supports:

* reserved layout (desktop)
* overlay behavior (mobile)
* responsive switching

#### Body

The main content area.

Automatically adjusts based on active surfaces.

#### Drawer

Overlay surface for transient interactions.

<Drawer edge="left" open={open} />

## How it works

Under the hood, each surface declares:

edge: "left" | "right" | "top" | "bottom"
occupancy: "none" | "reserved" | "visible-driven"
visibility: "visible" | "hidden"
reveal: "manual" | "scroll-toward" | "pointer-proximity" | "always"
order: number

The layout engine uses this to:

* compute offsets
* resolve conflicts
* coordinate surfaces

## Advanced usage

You can bypass the primitives and register surfaces directly:

import { createSurface } from "solid-surfaces"
const surface = createSurface({
  edge: "top",
  occupancy: "visible-driven",
  reveal: "scroll-toward"
})

This allows:

* custom behaviors
* non-standard layouts
* full control over interaction

## Design goals

* Composable — surfaces work together, not in isolation
* Predictable — layout is derived from explicit rules
* Headless — no styling or visual assumptions
* Practical — works for real app shells, not just demos

## Accessibility

This library does not manage:

* ARIA roles
* focus trapping
* keyboard interactions

Consumers are responsible for implementing accessible patterns appropriate to their use case.

## Installation

npm install solid-surfaces

## Roadmap

* Core layout engine
* Header / Rail / Drawer primitives
* Responsive behavior helpers
* Accessibility helpers (optional, headless)
* Devtools / visualization (long-term)

## Contributing

Contributions are welcome.

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
