import { render } from "solid-js/web"
import App from "./app"
import { Theme } from "shiki/textmate"
import { ThemeProvider } from "solid-theme-provider"
import { themes } from "./lib/themes"

const root = document.getElementById("root")!
render(() => 
  <ThemeProvider themes={themes}>
    <App />
  </ThemeProvider>
, root)
