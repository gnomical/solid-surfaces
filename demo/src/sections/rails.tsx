import type { Accessor, Setter } from "solid-js"
import { JourneySection } from "../components/JourneySection"
import { Button } from "../components/Button"
import { CodeBlock } from "../components/Code"

type RailsSectionProps = {
  show: boolean
  headerAdded: Accessor<boolean>
  setHeaderAdded: Setter<boolean>
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
          disabled={props.headerAdded()}
          onClick={() => props.setHeaderAdded(true)}
        >
          {props.headerAdded() ? "Header Added" : "Add Header"}
        </Button>
      }
      onContinue={props.onContinue}
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
  )
}
