import { createSignal, onMount } from "solid-js"
import { LayoutRoot, Overlay, Body } from "solid-surfaces"
import "./app.css"
import { CLOSE_ICON } from "./lib/constants"
import { ThemeToggle } from "./components/ThemeToggle"

export default function App() {
  const [layoutRootActivated, setLayoutRootActivated] = createSignal(false)
  const [overlayOpen, setOverlayOpen] = createSignal(false)

  let layoutRootSectionRef!: HTMLElement

  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLayoutRootActivated(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(layoutRootSectionRef)
  })

  return (
    <LayoutRoot class={layoutRootActivated() ? "root activated" : "root"}>
      <ThemeToggle classList={{'theme-toggle': true}}/>

      <Body>
        <div class="body-content">

          <section class="journey-section intro-section">
            <h1>Surface Kit</h1>
            <p>
              Building UIs that need sidebars, headers, drawers, and navigation panels
              means wrestling with layout. Surfaces pile up. Responsive breakpoints
              collapse some panels into overlays while others stay reserved. Scroll
              behavior hides or reveals things at different thresholds. And all the while,
              your main content needs to stay centered and unbroken.
            </p>
            <p>
              <strong>Surface Kit</strong> is a layout library that makes
              edge-attached UI surfaces composable. It coordinates a CSS Grid where
              each surface declares its edge, stacking order, and behavior. 
              The grid responds automatically. Corners are allocated. Breakpoints 
              are respected. Scroll-reveal is built in.
            </p>
            <p>This is a guided tour of the library. Scroll to see each concept come to life.</p>
          </section>

          <section class="journey-section" ref={layoutRootSectionRef}>
            <h2>LayoutRoot</h2>
            <p>
              Every solid-surfaces layout starts with <code>LayoutRoot</code>. It is the
              root grid container — a single <code>div</code> that fills its parent and
              manages a CSS Grid whose tracks are computed dynamically as surfaces register
              themselves.
            </p>
            <p>
              You can see <code>LayoutRoot</code> right now: it is the outermost element
              wrapping this entire viewport. The border appearing around the page is the{" "}
              <code>LayoutRoot</code> element itself, styled to make its boundary visible.
            </p>
            <p>
              <code>LayoutRoot</code> accepts an <code>axisPriority</code> prop —{" "}
              <code>"horizontal"</code> or <code>"vertical"</code> — which determines which
              axis owns corner cells when surfaces on crossing edges both want them. It also
              accepts a <code>corners</code> prop for per-corner explicit overrides.
            </p>
          </section>

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
