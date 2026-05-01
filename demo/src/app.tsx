import { createSignal, Show } from "solid-js"
import { LayoutRoot, Overlay, Body, Rail } from "solid-surfaces"
import "./app.css"
import { CLOSE_ICON, SQUARE_ROUNDED_ICON } from "./lib/constants"
import { Button } from "./components/Button"
import { ThemeToggle } from "./components/ThemeToggle"
import { JourneySection } from "./components/JourneySection"
import { CodeBlock } from "./components/Code"

export default function App() {
  const [step, setStep] = createSignal(0)
  const [layoutRootActivated, setLayoutRootActivated] = createSignal(false)
  const [headerAdded, setHeaderAdded] = createSignal(false)
  const [iconBarAdded, setIconBarAdded] = createSignal(false)
  const [navAdded, setNavAdded] = createSignal(false)
  const [navSpan, setNavSpan] = createSignal<"inset" | "full">("full")
  const [axisPriority, setAxisPriority] = createSignal<"horizontal" | "vertical">("horizontal")
  const [overlayOpen, setOverlayOpen] = createSignal(false)

  let layoutRootSection!: HTMLElement
  let railsSection!: HTMLElement
  let iconBarSection!: HTMLElement
  let navSection!: HTMLElement

  const revealAndScroll = (nextStep: number, getEl: () => HTMLElement) => {
    setStep(nextStep)
    queueMicrotask(() => getEl()?.scrollIntoView({ behavior: "smooth", block: "start" }))
  }

  return (
    <LayoutRoot class={layoutRootActivated() ? "root activated" : "root"} axisPriority={axisPriority()}>
      <ThemeToggle classList={{'theme-toggle': true}}/>

      <Show when={headerAdded()}>
        <Rail edge="top">
          <div class="surface horizontal header">
            <span class="brand">Surface Kit</span>
          </div>
        </Rail>
      </Show>
    
      <Show when={iconBarAdded()}>
        <Rail edge="left" order={0}>
          <div class="surface vertical icon-bar">
            <Button size="sm" variant="secondary"></Button>
            <Button size="sm" variant="secondary"></Button>
            <Button size="sm" variant="secondary"></Button>
            <Button size="sm" variant="secondary"></Button>
          </div>
        </Rail>
      </Show>

      <Show when={navAdded()}>
        <Rail edge="left" order={1} span={navSpan()}>
          <div class="surface vertical nav">
            <span class="brand">Nav</span>
            <div class="nav-item"><span class="nav-icon">⌂</span><span>Home</span></div>
            <div class="nav-item"><span class="nav-icon">◫</span><span>Layout</span></div>
            <div class="nav-item"><span class="nav-icon">◈</span><span>Surfaces</span></div>
            <div class="nav-item"><span class="nav-icon">⚙</span><span>Settings</span></div>
          </div>
        </Rail>
      </Show>

      <Body class="body">
        <div class="body-content">

          <JourneySection
            onContinue={() => revealAndScroll(1, () => layoutRootSection)}
          >
            <h1>Surface Kit</h1>
            <p>
              Building UIs that need sidebars, headers, drawers, and navigation panels
              means wrestling with layout. Surfaces pile up. Responsive breakpoints get kicked
              down the road. Complex animations need coordination between multiple surfaces.
              And all the while, your main content needs to stay centered and unbroken.
            </p>
            <p>
              <strong>Surface Kit</strong> is a layout library that makes
              edge-attached UI surfaces composable. It coordinates a CSS Grid where
              each surface declares its edge, stacking order, and behavior.
              The grid responds automatically. Corners are allocated. Breakpoints
              are respected. Reveal behavior is built in.
            </p>
            <p>This is a guided tour of the library.</p>
          </JourneySection>

          <JourneySection
            ref={layoutRootSection}
            show={step() >= 1}
            action={
              <Button
                disabled={layoutRootActivated()}
                onClick={() => setLayoutRootActivated(true)}
              >
                {layoutRootActivated() ? "Revealed" : "Reveal It"}
              </Button>
            }
            onContinue={layoutRootActivated() ? () => revealAndScroll(2, () => railsSection) : undefined}
            continueLabel="Next"
          >
            <h2>LayoutRoot</h2>
            <p>
              Every Surface Kit layout starts with <code>LayoutRoot</code>. It is the
              root grid container — a single <code>div</code> that fills its parent and
              manages a CSS Grid whose tracks are computed dynamically as surfaces register
              themselves.
            </p>
            <p>
              <code>LayoutRoot</code> is the outermost element wrapping this entire
              viewport.
            </p>
          </JourneySection>

          <JourneySection
            ref={railsSection}
            show={step() >= 2}
            action={
              <Button
                disabled={headerAdded()}
                onClick={() => setHeaderAdded(true)}
              >
                {headerAdded() ? "Header Added" : "Add Header"}
              </Button>
            }
            onContinue={headerAdded() ? () => revealAndScroll(3, () => iconBarSection) : undefined}
            continueLabel="Next"
          >
            <h2>Rails</h2>
            <p>
              A <code>Rail</code> is a reserved surface — it claims a track in the grid
              and pushes the body content aside. Rails attach to any edge:{" "}
              <code>top</code>, <code>bottom</code>, <code>left</code>, or{" "}
              <code>right</code>.
            </p>
            <p>
              The grid reacts automatically. No manual offset calculations, no fighting
              with <code>position</code>.
            </p>
            <CodeBlock code={`<Rail edge="top">
  <div class="header">
    <span>Surface Kit</span>
  </div>
</Rail>`} />
          </JourneySection>

          <JourneySection
            ref={iconBarSection}
            show={step() >= 3}
            onContinue={iconBarAdded() ? () => revealAndScroll(4, () => navSection) : undefined}
            continueLabel="Next"
          >
            <h2>axisPriority</h2>
            <p>
              When rails on different axes meet at a corner,{" "}
              <code>axisPriority</code> on <code>LayoutRoot</code> decides which
              edge wins.
            </p>
            <Show when={!iconBarAdded()}>
              <p>
                Let's add a rail to the left edge and see how it works.
              </p>
              <CodeBlock code={`<Rail edge="left">
    <div class="icon-bar">…</div>
  </Rail>`} />
              <Button
                  disabled={iconBarAdded()}
                  onClick={() => setIconBarAdded(true)}
                >
                  Add Left Rail
                </Button>
            </Show>
            <Show when={iconBarAdded()}>
              <div class="controls">
                <label><strong>axisPriority</strong></label>
                <label>
                  <input
                    type="radio"
                    name="axisPriority"
                    value="horizontal"
                    checked={axisPriority() === "horizontal"}
                    onChange={() => setAxisPriority("horizontal")}
                  />
                  {" "}horizontal — header owns the corner
                </label>
                <label>
                  <input
                    type="radio"
                    name="axisPriority"
                    value="vertical"
                    checked={axisPriority() === "vertical"}
                    onChange={() => setAxisPriority("vertical")}
                  />
                  {" "}vertical — icon bar owns the corner
                </label>
              </div>
            </Show>
          </JourneySection>

          <JourneySection
            ref={navSection}
            show={step() >= 4}
            action={
              <Button
                disabled={navAdded()}
                onClick={() => setNavAdded(true)}
              >
                {navAdded() ? "Nav Added" : "Add Nav Panel"}
              </Button>
            }
          >
            <h2>Stacking and Span</h2>
            <p>
              Multiple rails can share the same edge. The <code>order</code> prop
              controls their stacking — lower order is closer to the viewport edge.
              Here, the nav panel stacks to the right of the icon bar using{" "}
              <code>{"order={1}"}</code>.
            </p>
            <CodeBlock code={`<Rail edge="left" order={0}>
  <div class="icon-bar">…</div>
</Rail>

<Rail edge="left" order={1} span="full">
  <nav class="nav">…</nav>
</Rail>`} />
            <p>
              The <code>span</code> prop lets a rail claim corner cells explicitly.
              The default is <code>"full"</code> — the nav panel owns the corner
              unconditionally, regardless of <code>axisPriority</code>. Switch to{" "}
              <code>"inset"</code> to defer back to <code>axisPriority</code>.
            </p>
            <div class="controls">
              <label><strong>nav panel span</strong></label>
              <label>
                <input
                  type="radio"
                  name="navSpan"
                  value="full"
                  checked={navSpan() === "full"}
                  onChange={() => setNavSpan("full")}
                />
                {" "}full — nav panel always owns the corner
              </label>
              <label>
                <input
                  type="radio"
                  name="navSpan"
                  value="inset"
                  checked={navSpan() === "inset"}
                  onChange={() => setNavSpan("inset")}
                />
                {" "}inset — axisPriority governs the corner
              </label>
            </div>
          </JourneySection>

          <div class="copyright">© {new Date().getFullYear()} Jacob Kofron</div>
        </div>
      </Body>

      <Overlay edge="bottom" open={overlayOpen()} span="full">
        <div class="surface drawer">
          <p style={{ "margin-top": "0.5rem" }}>
            An <code>Overlay</code> surface — edge-attached, but not reserved in the grid.
          </p>
          <button onClick={() => setOverlayOpen(false)} class="close">
            {CLOSE_ICON()}
          </button>
        </div>
      </Overlay>
    </LayoutRoot>
  )
}
