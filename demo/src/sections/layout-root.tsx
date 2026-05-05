import type { Accessor, Setter } from "solid-js"
import { JourneySection } from "../components/JourneySection"
import { Button } from "../components/Button"

type LayoutRootSectionProps = {
  show: boolean
  layoutRootActivated: Accessor<boolean>
  setLayoutRootActivated: Setter<boolean>
  onContinue: (() => void) | undefined
  ref: (el: HTMLElement) => void
}

export function LayoutRootSection(props: LayoutRootSectionProps) {
  return (
    <JourneySection
      ref={props.ref}
      show={props.show}
      action={
        <Button
          disabled={props.layoutRootActivated()}
          onClick={() => props.setLayoutRootActivated(true)}
        >
          {props.layoutRootActivated() ? "Revealed" : "Reveal It"}
        </Button>
      }
      onContinue={props.onContinue}
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
  )
}
