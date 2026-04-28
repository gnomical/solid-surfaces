import { splitProps } from "solid-js"
import type { ComponentProps } from "solid-js"
import styles from "./Button.module.css"

type ButtonProps = ComponentProps<"button"> & {
  variant?: "filled" | "outlined" | "ghost"
  size?: "sm" | "md" | "lg"
}

export function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, ["variant", "size", "class", "classList", "children"])

  return (
    <button
      {...rest}
      classList={{
        [styles.button]: true,
        [styles[local.variant ?? "outlined"]]: true,
        [styles[local.size ?? "md"]]: true,
        ...local.classList,
      }}
      class={local.class}
    >
      {local.children}
    </button>
  )
}
