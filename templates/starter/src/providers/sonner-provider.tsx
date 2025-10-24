import * as React from "react"
import { Toaster } from "sonner"
import { useTheme } from "@/hooks/use-theme"

type SonnerProviderProps = { children: React.ReactNode }

export function SonnerProvider({ children }: SonnerProviderProps) {
  const { theme } = useTheme();

  return (
    <>
      {children}
      <Toaster
        position="top-center"
        theme={theme}
        richColors
        expand
        duration={3000}
        visibleToasts={3}
      />
    </>
  )
}