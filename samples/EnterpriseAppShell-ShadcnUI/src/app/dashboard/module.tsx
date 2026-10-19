import * as React from "react"
import { LayoutDashboardIcon } from "lucide-react"

import type { AppModule } from "@/lib/module"

export const dashboardModule: AppModule = {
  id: "dashboard",
  title: "Dashboard",
  group: "main",
  icon: <LayoutDashboardIcon />,
  routes: [
    {
      path: "",
      title: "Overview",
      nav: "Dashboard",
      element: React.lazy(() => import("./page")),
    },
  ],
}
