import { createSignal, For } from "solid-js"
import { LayoutRoot, Rail, Overlay, Body } from "solid-surfaces"
import type { AxisPriority } from "solid-surfaces"
import "./app.css"
import { CLOSE_ICON, SIDEBAR_ICON, SIDEBAR_ICON_FILLED } from "./lib/constants"

const LOREM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,
sunt in culpa qui officia deserunt mollit anim id est laborum.`

export default function App() {
  const [overlayOpen, setOverlayOpen] = createSignal(false)
  const [axisPriority, setAxisPriority] = createSignal<AxisPriority>("horizontal")
  const [overlaySpanInset, setOverlaySpanInset] = createSignal(false)

  return (
    <LayoutRoot class="root" axisPriority={axisPriority()}>
      {/* Top rail — hides on scroll down, reveals on scroll up; span=full claims corners */}
      <Rail edge="top" reveal="scroll-toward" span="full">
        <header class="surface horizontal header">
          <span class="brand">solid-surfaces</span>
          <span class="chip">
            Rail edge="top" span="full" reveal="scroll-toward" 
          </span>
          <button onClick={() => setOverlayOpen((v) => !v)} style="transform: rotate(-90deg)">
            {overlayOpen() ? <SIDEBAR_ICON_FILLED /> : <SIDEBAR_ICON />}
          </button>
        </header>
      </Rail>

      {/* Left rail (order=0) — icon bar, reserved on desktop */}
      <Rail edge="left" order={0}>
        <nav class="surface vertical nav icon-bar">
          <span class="nav-icon">⊞</span>
          <span class="nav-icon">⊟</span>
          <span class="nav-icon">⊠</span>
          <div style={{ "margin-top": "auto", "width": "1.2em" }}>
            <span class="chip vertical">Rail edge="left" order="0"</span>
          </div>
        </nav>
      </Rail>

      {/* Left rail (order=1) — file tree, inset from the icon bar */}
      <Rail edge="left" order={1} responsive breakpoint={768}>
        <nav class="surface vertical nav">
          <span>Nav item 1</span>
          <span>Nav item 2</span>
          <span>Nav item 3</span>
          <div style={{ "margin-top": "auto"}}>
            {/* <span class="chip">Rail<br/>&nbsp;&nbsp;edge="left"<br/>&nbsp;&nbsp;order="1"<br/>&nbsp;&nbsp;breakpoint="768"<br/></span> */}
            <span class="chip vertical">Rail edge="left" order="1" breakpoint="768"</span>
          </div>
        </nav>
      </Rail>

      {/* Body */}
      <Body>
        <div class="body-content">
          <h1>solid-surfaces Demo</h1>

          <div class="controls">
            <label>
              <span>axisPriority</span>
              <select
                value={axisPriority()}
                onChange={(e) => setAxisPriority(e.currentTarget.value as AxisPriority)}
              >
                <option value="horizontal">horizontal (top/bottom own corners)</option>
                <option value="vertical">vertical (left/right own corners)</option>
              </select>
            </label>
            <label>
              <input
                type="checkbox"
                checked={overlaySpanInset()}
                onChange={(e) => setOverlaySpanInset(e.currentTarget.checked)}
              />
              {" "}Overlay span="inset" (bounded by top rail)
            </label>
          </div>

          <p>
            Two left Rails with different <code>order</code> values each get their own
            column track. The top Rail uses <code>span="full"</code>. Toggle{" "}
            <code>axisPriority</code> above to shift corner ownership between the top/bottom
            and left/right rails.
          </p>
          <p>
            Resize below 768px to collapse both left rails to overlay mode. Scroll to
            hide/reveal the top rail.
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

      {/* Bottom overlay — demonstrates span="inset" vs span="full" */}
      <Overlay edge="bottom" open={overlayOpen()} span={overlaySpanInset() ? "inset" : "full"}>
        <div class="surface drawer">
          <strong>Bottom Overlay</strong>
          <span class="chip" style={{ "margin-left": "0.5rem" }}>
            Overlay edge="bottom" span="{overlaySpanInset() ? "inset" : "full"}"
          </span>
          <p style={{ "margin-top": "0.5rem" }}>
            {overlaySpanInset()
              ? "span=\"inset\": bounded by the left rail column tracks."
              : "span=\"full\": stretches edge to edge."}
          </p>
          <button onClick={() => setOverlayOpen(false)} class="close">
            {CLOSE_ICON()}
          </button>
        </div>
      </Overlay>
    </LayoutRoot>
  )
}
