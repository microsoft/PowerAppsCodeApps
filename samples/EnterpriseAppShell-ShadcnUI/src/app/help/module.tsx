import * as React from "react"
import { CircleHelpIcon } from "lucide-react"

import type { AppModule } from "@/lib/module"

export const helpModule: AppModule = {
  id: "help",
  title: "Get Help",
  group: "secondary",
  icon: <CircleHelpIcon />,
  routes: [
    {
      path: "help",
      title: "Get Help",
      nav: "Get Help",
      element: React.lazy(() => import("./page")),
    },
  ],
}
