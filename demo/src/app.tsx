import { createSignal, createEffect, Show } from "solid-js"
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

const ghostSpeed = 200

export default function App() {
  const [step, setStep] = createSignal(0)
  const [layoutRootActivated, setLayoutRootActivated] = createSignal(false)
  const [layoutRootEmphasized, setLayoutRootEmphasized] = createSignal(false)
  const [layoutRootComplete, setLayoutRootComplete] = createSignal(false)
  const [ghostIconBar, setGhostIconBar] = createSignal(false)
  const [ghostNav, setGhostNav] = createSignal(false)
  const [ghostHeader, setGhostHeader] = createSignal(false)
  const [ghostRight, setGhostRight] = createSignal(false)
  const [ghostRightDrawer, setGhostRightDrawer] = createSignal(false)
  const [ghostDrawer, setGhostDrawer] = createSignal(false)
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

  createEffect(() => {
    if (!layoutRootActivated()) return
    setTimeout(() => setGhostIconBar(true),         ghostSpeed * 5)

    setTimeout(() => setGhostRightDrawer(true),     ghostSpeed * 8)
    setTimeout(() => setGhostRightDrawer(false),    ghostSpeed * 10)
    setTimeout(() => setGhostHeader(true),          ghostSpeed * 11)

    setTimeout(() => setGhostNav(true),             ghostSpeed * 15)
    setTimeout(() => setGhostRight(true),           ghostSpeed * 15)

    setTimeout(() => setGhostDrawer(true),          ghostSpeed * 18)
    setTimeout(() => setGhostDrawer(false),         ghostSpeed * 20)

    setTimeout(() => setGhostRight(false),          ghostSpeed * 22)
    setTimeout(() => setGhostIconBar(false),        ghostSpeed * 22)
    setTimeout(() => setGhostHeader(false),         ghostSpeed * 22)
    setTimeout(() => setGhostNav(false),            ghostSpeed * 22)
    
    setTimeout(() => setLayoutRootEmphasized(true), ghostSpeed * 24)

    setTimeout(() => setLayoutRootComplete(true),   ghostSpeed * 26)
  })

  const revealAndScroll = (nextStep: number, getEl: () => HTMLElement) => {
    setStep(nextStep)
    queueMicrotask(() => getEl()?.scrollIntoView({ behavior: "smooth", block: "start" }))
  }

  return (
    <LayoutRoot class="root" axisPriority={axisPriority()} classList={{
      "activated": layoutRootActivated(),
      "blink": layoutRootEmphasized(),
    }}>

      <Rail edge="top" visibility={ghostHeader() ? "visible" : "hidden"}>
        <div class="surface horizontal top ghost" style={{height: "70px"}}/>
      </Rail>

      <Rail edge="left" span="inset" visibility={ghostIconBar() ? "visible" : "hidden"}>
        <div class="surface vertical left ghost" style={{width: "60px"}}/>
      </Rail>

      <Rail edge="left" span="inset" visibility={ghostNav() ? "visible" : "hidden"}>
        <div class="surface vertical left ghost" style={{width: "200px"}} />
      </Rail>

      <Rail edge="right" visibility={ghostRight() ? "visible" : "hidden"}>
        <div class="surface vertical right ghost" style={{width: "200px"}} />
      </Rail>

      <Overlay class="overlay" edge="right" open={ghostRightDrawer()} span="full">
        <div class="surface vertical drawer right ghost" style={{width: "30vw"}} />
      </Overlay>

      <Overlay class="overlay" open={ghostDrawer()} edge="bottom" span="full">
        <div class="surface horizontal drawer bottom ghost" style={{height: "25vh"}} />
      </Overlay>

      <Rail edge="top" visibility={step() >= 2 ? "visible" : "hidden"}>
        <div class="surface horizontal top header">
          <span class="brand">Surface Kit</span>
          <ThemeToggle classList={{'theme-toggle': true}}/>
        </div>
      </Rail>

      { /* theme toggle before the demo gets started */}
      <Show when={!layoutRootActivated()}>
        <Overlay edge="top" open={true} span="inset">
          <div class="surface horizontal header">
            <ThemeToggle classList={{'theme-toggle': true}}/>
          </div>
        </Overlay>
      </Show>


      <Rail edge="left" order={0} visibility={iconBarAdded() ? "visible" : "hidden"}>
        <div class="surface vertical left icon-bar">
          <Button size="sm" variant="secondary"></Button>
          <Button size="sm" variant="secondary"></Button>
          <Button size="sm" variant="secondary"></Button>
          <Button size="sm" variant="secondary"></Button>
        </div>
      </Rail>

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

          <IntroSection
            onContinue={() => revealAndScroll(1, () => layoutRootSection)}
          />

          <LayoutRootSection
            ref={(el) => { layoutRootSection = el }}
            show={step() >= 1}
            layoutRootActivated={layoutRootActivated}
            setLayoutRootActivated={setLayoutRootActivated}
            onContinue={layoutRootComplete() ? () => revealAndScroll(2, () => railsSection) : undefined}
          />

          <RailsSection
            ref={(el) => { railsSection = el }}
            show={step() >= 2}
            iconBarAdded={iconBarAdded}
            setIconBarAdded={setIconBarAdded}
            onContinue={iconBarAdded() ? () => revealAndScroll(3, () => iconBarSection) : undefined}
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
