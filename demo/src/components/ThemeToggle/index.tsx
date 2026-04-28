import { createMemo } from "solid-js"
import { BULB_OFF_ICON, BULB_ICON } from "../../lib/constants"
import { useTheme } from "solid-theme-provider"
import { Button } from "../Button"

export function ThemeToggle(props: { classList?: Record<string, boolean> }) {
  const ctx = useTheme()

  // Prefer toggling between the system-defined dark/light pair.
  // Falls back to the first theme that isn't current when no system config exists.
  const otherTheme = createMemo(() => {
    const current = ctx.currentTheme()
    if (ctx.systemThemesCorrect()) {
      const { dark, light } = ctx.systemThemes()!
      return current === dark ? light : dark
    }
    return ctx.themeKeys().find(k => k !== current) ?? ctx.themeKeys()[0]
  })

  function toggle() {
    ctx.setUseSystem(false)
    ctx.setTheme(otherTheme())
  }

  const icon = () => {
    const theme = ctx.themes()[otherTheme()]
    if (ctx.systemThemes()?.dark === otherTheme()) return BULB_OFF_ICON()
    return BULB_ICON()
  }

  return (
    <Button
      classList={props.classList}
      onMouseDown={toggle}
      size="sm"
    >
      {icon()}
    </Button>
  )
}
