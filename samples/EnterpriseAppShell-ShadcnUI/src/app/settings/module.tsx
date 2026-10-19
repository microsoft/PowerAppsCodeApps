import * as React from "react"
import { Settings2Icon } from "lucide-react"

import type { AppModule } from "@/lib/module"

export const settingsModule: AppModule = {
  id: "settings",
  title: "Settings",
  group: "secondary",
  icon: <Settings2Icon />,
  routes: [
    {
      path: "settings",
      title: "Settings",
      nav: "Settings",
      element: React.lazy(() => import("./page")),
    },
  ],
}
