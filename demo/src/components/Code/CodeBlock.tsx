import { createResource, createSignal, Show } from "solid-js"
import { createHighlighter } from "shiki"
import { useTheme } from "solid-theme-provider"
import { CHECK_ICON, COPY_ICON } from "../../lib/constants"
import styles from "./Code.module.css"

const shikiThemeMap: Record<string, string> = {
  dark: "aurora-x",
  light: "light-plus",
}

const highlighterPromise = createHighlighter({
  themes: ["aurora-x", "light-plus"],
  langs: ["tsx", "html", "css", "json"],
})

type CodeBlockProps = {
  code: string
  lang?: string
}

export function CodeBlock(props: CodeBlockProps) {
  const ctx = useTheme()
  const [copied, setCopied] = createSignal(false)
  const [clicked, setClicked] = createSignal(false)

  const shikiTheme = () => shikiThemeMap[ctx.currentTheme()] ?? "github-dark"

  const [html] = createResource(
    () => [props.code, shikiTheme()] as const,
    async ([code, theme]) => {
      const highlighter = await highlighterPromise
      return highlighter.codeToHtml(code, {
        lang: props.lang ?? "tsx",
        theme,
      })
    },
  )

  let pendingCopy = false

  const onMouseDown = () => {
    navigator.clipboard.writeText(props.code)
    setCopied(true)
    pendingCopy = true
  }

  const onMouseUp = () => {
    if (pendingCopy) {
      pendingCopy = false
      setClicked(true)
    }
  }

  const onMouseLeave = () => {
    pendingCopy = false
    if (clicked()) setTimeout(() => { setClicked(false); setCopied(false) }, 1500)
  }

  return (
    <Show
      when={html()}
      fallback={
        <pre>
          <code>{props.code}</code>
        </pre>
      }
    >
      <div
        class={clicked() ? `${styles.wrapper} ${styles.clicked}` : styles.wrapper}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        title="Copy"
      >
        <div class={styles.code} innerHTML={html()} />
        <div class={styles.copyIcon}>
          <Show when={copied()} fallback={COPY_ICON()}>
            {CHECK_ICON()}
          </Show>
        </div>
      </div>
    </Show>
  )
}
