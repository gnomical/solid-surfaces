import type { Accessor, Setter } from "solid-js"
import { JourneySection } from "../components/JourneySection"
import { Button } from "../components/Button"
import { CodeBlock } from "../components/Code"

type StackingSectionProps = {
  show: boolean
  navAdded: Accessor<boolean>
  setNavAdded: Setter<boolean>
  navSpan: Accessor<"inset" | "full">
  setNavSpan: Setter<"inset" | "full">
  ref: (el: HTMLElement) => void
}

export function StackingSection(props: StackingSectionProps) {
  return (
    <JourneySection
      ref={props.ref}
      show={props.show}
      action={
        <Button
          disabled={props.navAdded()}
          onClick={() => props.setNavAdded(true)}
        >
          {props.navAdded() ? "Nav Added" : "Add Nav Panel"}
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
            checked={props.navSpan() === "full"}
            onChange={() => props.setNavSpan("full")}
          />
          {" "}full — nav panel always owns the corner
        </label>
        <label>
          <input
            type="radio"
            name="navSpan"
            value="inset"
            checked={props.navSpan() === "inset"}
            onChange={() => props.setNavSpan("inset")}
          />
          {" "}inset — axisPriority governs the corner
        </label>
      </div>
    </JourneySection>
  )
}
