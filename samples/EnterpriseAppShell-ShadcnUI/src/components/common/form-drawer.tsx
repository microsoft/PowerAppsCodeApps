import * as React from "react"

import { FormShell } from "./form-sheet"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"

/**
 * Drawer twin of `FormSheet`. Slides up from the bottom on a phone, in from the
 * right on a desktop, which is where a full record form has room to breathe.
 */
export function FormDrawer({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "right"}
    >
      {/* Content unmounts on close, so each open starts from clean state. */}
      <DrawerContent className="gap-0 data-[vaul-drawer-direction=bottom]:max-h-[90vh] data-[vaul-drawer-direction=right]:sm:max-w-xl">
        {children}
      </DrawerContent>
    </Drawer>
  )
}

/** `FormShell` wired to the drawer's heading primitives. */
export function DrawerFormShell(
  props: Omit<React.ComponentProps<typeof FormShell>, "Title" | "Description">,
) {
  return <FormShell {...props} Title={DrawerTitle} Description={DrawerDescription} />
}
