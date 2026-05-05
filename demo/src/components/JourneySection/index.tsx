import { splitProps, Show } from "solid-js"
import type { ComponentProps, JSX } from "solid-js"
import { Button } from "../Button"
import styles from "./JourneySection.module.css"

type JourneySectionProps = ComponentProps<"section"> & {
  show?: boolean
  action?: JSX.Element
  onContinue?: () => void
  continueLabel?: string
}

export function JourneySection(props: JourneySectionProps) {
  const [local, rest] = splitProps(props, ["show", "action", "onContinue", "continueLabel", "children"])

  const hasFooter = () => local.action !== undefined || !!local.onContinue

  return (
    <Show when={local.show ?? true}>
      <section
        {...rest}
        class={styles.journeySection}
      >
        {local.children}
        <Show when={hasFooter()}>
          <div class={styles.journeyActions}>
            <div>{local.action}</div>
            <Show when={local.onContinue}>
              <Button onClick={local.onContinue}>
                {local.continueLabel ?? "Continue"}
              </Button>
            </Show>
          </div>
        </Show>
      </section>
    </Show>
  )
}
