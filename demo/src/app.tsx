import { createSignal, Show } from "solid-js"
import { LayoutRoot, Overlay, Body, Rail } from "solid-surfaces"
import "./app.css"
import { CLOSE_ICON } from "./lib/constants"
import { Button } from "./components/Button"
import { ThemeToggle } from "./components/ThemeToggle"
import { JourneySection } from "./components/JourneySection"
import { CodeBlock } from "./components/Code"

export default function App() {
  const [step, setStep] = createSignal(0)
  const [layoutRootActivated, setLayoutRootActivated] = createSignal(false)
  const [headerAdded, setHeaderAdded] = createSignal(false)
  const [overlayOpen, setOverlayOpen] = createSignal(false)

  let layoutRootSection!: HTMLElement
  let railsSection!: HTMLElement

  const revealAndScroll = (nextStep: number, getEl: () => HTMLElement) => {
    setStep(nextStep)
    queueMicrotask(() => getEl()?.scrollIntoView({ behavior: "smooth", block: "start" }))
  }

  return (
    <LayoutRoot class={layoutRootActivated() ? "root activated" : "root"}>
      <ThemeToggle classList={{'theme-toggle': true}}/>

      <Show when={headerAdded()}>
        <Rail edge="top">
          <div class="surface horizontal header">
            <span class="brand">Surface Kit</span>
          </div>
        </Rail>
      </Show>

      <Body>
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
