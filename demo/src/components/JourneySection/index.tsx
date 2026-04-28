import { splitProps, Show } from "solid-js"
import type { ComponentProps } from "solid-js"
import { Button } from "../Button"

type JourneySectionProps = ComponentProps<"section"> & {
  show?: boolean
  onContinue?: () => void
  continueLabel?: string
}

export function JourneySection(props: JourneySectionProps) {
  const [local, rest] = splitProps(props, ["show", "onContinue", "continueLabel", "children", "class"])

  return (
    <Show when={local.show ?? true}>
      <section
        {...rest}
        class={local.class ? `journey-section ${local.class}` : "journey-section"}
      >
        {local.children}
        <Show when={local.onContinue}>
          <Button
            style={{ "align-self": "flex-start", "margin-top": "1rem" }}
            onClick={local.onContinue}
          >
            {local.continueLabel ?? "Continue"}
          </Button>
        </Show>
      </section>
    </Show>
  )
}
