import type { ThemesConfig } from "solid-theme-provider"

export const themes: ThemesConfig = {
  systemThemes: {
    dark: "dark",
    light: "light",
  },
  themes: {
    dark: {
      config: {
        browserThemeColor: "#111111",
      },
      vars: {
        background: "#111111",
        foreground: "#f3f3f3",
        accent: "#440080",
      },
    },
    light: {
      config: {
        browserThemeColor: "#ffffff",
      },
      vars: {
        background: "#ffffff",
        foreground: "#111111",
        accent: "#8800ff",
      },
    },
  },
}
