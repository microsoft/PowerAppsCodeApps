import { CheckIcon, PaletteIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { COLOR_THEMES, useTheme } from "@/lib/theme-context"

export function ThemeSelector() {
  const { colorTheme, setColorTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <PaletteIcon className="size-4" />
          <span className="sr-only">Select color theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {COLOR_THEMES.map((item) => (
          <DropdownMenuItem
            key={item.value}
            onClick={() => setColorTheme(item.value)}
          >
            <span
              className="size-4 shrink-0 rounded-full border"
              style={{ backgroundColor: item.swatch }}
            />
            {item.label}
            {colorTheme === item.value && (
              <CheckIcon className="ml-auto size-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
