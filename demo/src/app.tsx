import { createSignal, Show } from "solid-js"
import { LayoutRoot, Overlay, Body, Rail } from "solid-surfaces"
import "./app.css"
import { CLOSE_ICON } from "./lib/constants"
import { Button } from "./components/Button"
import { ThemeToggle } from "./components/ThemeToggle"
import { IntroSection } from "./sections/intro"
import { LayoutRootSection } from "./sections/layout-root"
import { RailsSection } from "./sections/rails"
import { AxisPrioritySection } from "./sections/axis-priority"
import { StackingSection } from "./sections/stacking"

export default function App() {
  const [step, setStep] = createSignal(0)
  const [layoutRootActivated, setLayoutRootActivated] = createSignal(false)
  const [ghostsActivated, setGhostsActivated] = createSignal(false)
  const [headerAdded, setHeaderAdded] = createSignal(false)
  const [iconBarAdded, setIconBarAdded] = createSignal(false)
  const [navAdded, setNavAdded] = createSignal(false)
  const [navSpan, setNavSpan] = createSignal<"inset" | "full">("full")
  const [axisPriority, setAxisPriority] = createSignal<"horizontal" | "vertical">("vertical")
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

      <Show when={ghostsActivated()}>
        <Rail edge="top"><div class="surface horizontal header ghost"></div></Rail>
        <Rail edge="left" span="inset"><div class="surface vertical icon-bar ghost"></div></Rail>
        <Rail edge="left" span="inset"><div class="surface vertical nav ghost"></div></Rail>
        <Rail edge="right"><div class="surface vertical right ghost" style={{width: "220px"}}></div></Rail>
        <Overlay open={true} edge="bottom" span="full"><div class="surface horizontal drawer ghost" style={{height: "220px"}}></div></Overlay>
      </Show>

      <Rail edge="top">
        <div class="surface horizontal header" classList={{
          "revealed": headerAdded(),
        }}>
          <Show when={headerAdded()}>
            <span class="brand">Surface Kit</span>
          </Show>
          <ThemeToggle classList={{'theme-toggle': true}}/>
        </div>
      </Rail>

      <Show when={iconBarAdded()}>
        <Rail edge="left" order={0}>
          <div class="surface vertical left icon-bar">
            <Button size="sm" variant="secondary"></Button>
            <Button size="sm" variant="secondary"></Button>
            <Button size="sm" variant="secondary"></Button>
            <Button size="sm" variant="secondary"></Button>
          </div>
        </Rail>
      </Show>

      <Show when={navAdded()}>
        <Rail edge="left" order={1} span={navSpan()}>
          <div class="surface vertical left nav">
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

          <IntroSection
            onContinue={() => revealAndScroll(1, () => layoutRootSection)}
          />

          <LayoutRootSection
            ref={(el) => { layoutRootSection = el }}
            show={step() >= 1}
            layoutRootActivated={layoutRootActivated}
            setLayoutRootActivated={setLayoutRootActivated}
            onContinue={layoutRootActivated() ? () => revealAndScroll(2, () => railsSection) : undefined}
          />

          <RailsSection
            ref={(el) => { railsSection = el }}
            show={step() >= 2}
            headerAdded={headerAdded}
            setHeaderAdded={setHeaderAdded}
            onContinue={headerAdded() ? () => revealAndScroll(3, () => iconBarSection) : undefined}
          />

          <AxisPrioritySection
            ref={(el) => { iconBarSection = el }}
            show={step() >= 3}
            iconBarAdded={iconBarAdded}
            setIconBarAdded={setIconBarAdded}
            axisPriority={axisPriority}
            setAxisPriority={setAxisPriority}
            onContinue={iconBarAdded() ? () => revealAndScroll(4, () => navSection) : undefined}
          />

          <StackingSection
            ref={(el) => { navSection = el }}
            show={step() >= 4}
            navAdded={navAdded}
            setNavAdded={setNavAdded}
            navSpan={navSpan}
            setNavSpan={setNavSpan}
          />

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
