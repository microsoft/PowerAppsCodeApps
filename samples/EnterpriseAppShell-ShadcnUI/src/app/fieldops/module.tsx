import * as React from "react"
import { MapPinnedIcon } from "lucide-react"

import type { AppModule } from "@/lib/module"

export const fieldopsModule: AppModule = {
  id: "fieldops",
  title: "FieldOps",
  group: "apps",
  icon: <MapPinnedIcon />,
  routes: [
    {
      path: "fieldops",
      title: "New Assignments",
      nav: "New Assignments",
      element: React.lazy(() => import("./page")),
    },
    {
      path: "fieldops/map",
      title: "Assignment Map",
      nav: "Assignment Map",
      element: React.lazy(() => import("./map-page")),
    },
    {
      path: "fieldops/dispatch",
      title: "Dispatch Board",
      nav: "Dispatch Board",
      element: React.lazy(() => import("./dispatch-page")),
    },
  ],
}
