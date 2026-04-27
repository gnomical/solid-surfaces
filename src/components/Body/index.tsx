import { onCleanup, onMount } from "solid-js"
import { useLayout } from "../../context/LayoutContext"
import styles from "./Body.module.css"
import type { BodyProps } from "../../lib/types"

export function Body(props: BodyProps) {
  const { setScrollContainer } = useLayout()
  let el!: HTMLElement

  onMount(() => {
    setScrollContainer(el)
    onCleanup(() => setScrollContainer(null))
  })

  return (
    <main
      ref={el}
      class={`${styles.body}${props.class ? ` ${props.class}` : ""}`}
      style={props.style}
    >
      {props.children}
    </main>
  )
}
