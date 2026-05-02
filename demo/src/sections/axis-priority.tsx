import type { Accessor, Setter } from "solid-js"
import { Show } from "solid-js"
import { JourneySection } from "../components/JourneySection"
import { Button } from "../components/Button"
import { CodeBlock } from "../components/Code"

type AxisPrioritySectionProps = {
  show: boolean
  iconBarAdded: Accessor<boolean>
  setIconBarAdded: Setter<boolean>
  axisPriority: Accessor<"horizontal" | "vertical">
  setAxisPriority: Setter<"horizontal" | "vertical">
  onContinue: (() => void) | undefined
  ref: (el: HTMLElement) => void
}

export function AxisPrioritySection(props: AxisPrioritySectionProps) {
  return (
    <JourneySection
      ref={props.ref}
      show={props.show}
      onContinue={props.onContinue}
      continueLabel="Next"
    >
      <h2>axisPriority</h2>
      <p>
        When rails on different axes meet at a corner,{" "}
        <code>axisPriority</code> on <code>LayoutRoot</code> decides which
        edge wins.
      </p>
      <Show when={!props.iconBarAdded()}>
        <p>
          Let's add a rail to the left edge and see how it works.
        </p>
        <CodeBlock code={`<Rail edge="left">
    <div class="icon-bar">…</div>
  </Rail>`} />
        <Button
          disabled={props.iconBarAdded()}
          onClick={() => props.setIconBarAdded(true)}
        >
          Add Left Rail
        </Button>
      </Show>
      <Show when={props.iconBarAdded()}>
        <div class="controls">
          <label><strong>axisPriority</strong></label>
          <label>
            <input
              type="radio"
              name="axisPriority"
              value="horizontal"
              checked={props.axisPriority() === "horizontal"}
              onChange={() => props.setAxisPriority("horizontal")}
            />
            {" "}horizontal — header owns the corner
          </label>
          <label>
            <input
              type="radio"
              name="axisPriority"
              value="vertical"
              checked={props.axisPriority() === "vertical"}
              onChange={() => props.setAxisPriority("vertical")}
            />
            {" "}vertical — icon bar owns the corner
          </label>
        </div>
      </Show>
    </JourneySection>
  )
}
