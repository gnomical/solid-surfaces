import { createSignal, For } from "solid-js"
import { LayoutRoot, Rail, Drawer, Body } from "solid-surfaces"
import "./app.css"
import { CLOSE_ICON, SIDEBAR_ICON, SIDEBAR_ICON_FILLED } from "./lib/constants"

const LOREM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,
sunt in culpa qui officia deserunt mollit anim id est laborum.`

export default function App() {
  const [drawerOpen, setDrawerOpen] = createSignal(false)

  return (
    <LayoutRoot>
      {/* Left rail — reserved on desktop, overlay on mobile */}
      <Rail edge="left" responsive breakpoint={768} size="220px">
        <nav class="surface vertical" style={{ "border-color": "green" }}>
          <strong>solid-surfaces</strong>
          <hr style={{ "border-color": "#333", margin: "0.25rem 0" }} />
          <span>Nav item 1</span>
          <span>Nav item 2</span>
          <span>Nav item 3</span>
          <div style={{ "margin-top": "auto" }}>
            <span class="chip">Rail edge="left"</span>
          </div>
        </nav>
      </Rail>

      {/* Top rail — hides on scroll down, reveals on scroll up */}
      <Rail edge="top" reveal="scroll-toward" size="60px">
        <header class="surface horizontal" style={{ "border-color": "pink" }}>
          <span>Top Rail — reveal: scroll-toward</span>
          <button onClick={() => setDrawerOpen((v) => !v)} style="transform: rotate(-90deg)">
            {drawerOpen() ? <SIDEBAR_ICON_FILLED /> : <SIDEBAR_ICON />}
          </button>
        </header>
      </Rail>

      {/* Body */}
      <Body>
        <div class="body-content">
          <h1>solid-surfaces v0.1.0 Demo</h1>
          <p>
            Resize the window below 768px to see the left Rail collapse to
            overlay mode. Scroll down to hide the top Rail, then scroll up to
            reveal it. Use the button above to toggle the bottom Drawer.
          </p>
          <For each={Array.from({ length: 20 })}>
            {(_, i) => (
              <p>
                <strong>Paragraph {i() + 1}:</strong> {LOREM}
              </p>
            )}
          </For>
        </div>
      </Body>

      {/* Bottom drawer — overlay, controlled open state */}
      <Drawer edge="bottom" open={drawerOpen()} size="200px">
        <div class="surface">
          <strong>Bottom Drawer</strong>
          <span class="chip" style={{ "margin-left": "0.5rem" }}>
            Drawer edge="bottom"
          </span>
          <p style={{ "margin-top": "0.5rem" }}>
            This is an overlay surface. It does not affect the grid layout.
          </p>
          <button onClick={() => setDrawerOpen(false)} class="close">  
            {CLOSE_ICON()}
          </button>
        </div>
      </Drawer>
    </LayoutRoot>
  )
}
