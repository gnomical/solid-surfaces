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

  const copy = () => {
    navigator.clipboard.writeText(props.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
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
      <div class={styles.wrapper}>
        <div class={styles.code} innerHTML={html()} />
        <button class={styles.copyButton} onClick={copy} title="Copy">
          <Show when={copied()} fallback={COPY_ICON()}>
            {CHECK_ICON()}
          </Show>
        </button>
      </div>
    </Show>
  )
}
