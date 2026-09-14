import { createContext, useContext } from "react"

export type Theme = "dark" | "light" | "system"

export type ColorTheme =
  | "neutral"
  | "blue"
  | "emerald"
  | "violet"
  | "indigo"
  | "cyan"
  | "rose"
  | "pink"
  | "orange"
  | "amber"

export const COLOR_THEMES: {
  value: ColorTheme
  label: string
  swatch: string
}[] = [
  { value: "neutral", label: "Neutral", swatch: "oklch(0.205 0 0)" },
  { value: "blue", label: "Blue", swatch: "oklch(0.546 0.245 262.881)" },
  { value: "emerald", label: "Emerald", swatch: "oklch(0.596 0.145 163.225)" },
  { value: "violet", label: "Violet", swatch: "oklch(0.541 0.281 293.009)" },
  { value: "indigo", label: "Indigo", swatch: "oklch(0.511 0.262 276.966)" },
  { value: "cyan", label: "Cyan", swatch: "oklch(0.609 0.126 221.723)" },
  { value: "rose", label: "Rose", swatch: "oklch(0.586 0.253 17.585)" },
  { value: "pink", label: "Pink", swatch: "oklch(0.592 0.249 0.584)" },
  { value: "orange", label: "Orange", swatch: "oklch(0.646 0.222 41.116)" },
  { value: "amber", label: "Amber", swatch: "oklch(0.769 0.188 70.08)" },
]

export type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  colorTheme: ColorTheme
  setColorTheme: (colorTheme: ColorTheme) => void
}

export const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "system",
  setTheme: () => null,
  colorTheme: "neutral",
  setColorTheme: () => null,
})

export function useTheme() {
  const context = useContext(ThemeProviderContext)

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
