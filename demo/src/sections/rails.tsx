import type { Accessor, Setter } from "solid-js"
import { JourneySection } from "../components/JourneySection"
import { Button } from "../components/Button"
import { CodeBlock } from "../components/Code"

type RailsSectionProps = {
  show: boolean
  iconBarAdded: Accessor<boolean>
  setIconBarAdded: Setter<boolean>
  onContinue: (() => void) | undefined
  ref: (el: HTMLElement) => void
}

export function RailsSection(props: RailsSectionProps) {
  return (
    <JourneySection
      ref={props.ref}
      show={props.show}
      action={
        <Button
          disabled={props.iconBarAdded()}
          onClick={() => props.setIconBarAdded(true)}
        >
          {props.iconBarAdded() ? "Icon Bar Added" : "Add Icon Bar"}
        </Button>
      }
      onContinue={props.onContinue}
      continueLabel="Next"
    >
      <h2>Rails</h2>
      <p>
        A <code>Rail</code> is a reserved surface — it claims space in the layout
        and pushes the body content aside. Rails attach to any edge:{" "}
        <code>top</code>, <code>bottom</code>, <code>left</code>, or{" "}
        <code>right</code>.
      </p>
      <p>
        The layout reacts automatically. No manual offset calculations, no fighting
        with <code>position</code>.
      </p>
      <p>
        The header above is a <code>Rail</code>. Let's add a left edge rail as well, and see how the layout adapts:
      </p>
      <CodeBlock code={`<Rail edge="left">...</Rail>`} />
    </JourneySection>
  )
}
