import styles from "./Body.module.css"
import type { BodyProps } from "../../lib/types"

export function Body(props: BodyProps) {
  return (
    <main
      class={`${styles.body}${props.class ? ` ${props.class}` : ""}`}
      style={props.style}
    >
      {props.children}
    </main>
  )
}
