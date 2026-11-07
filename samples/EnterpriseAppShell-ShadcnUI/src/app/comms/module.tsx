import * as React from "react"
import { MegaphoneIcon } from "lucide-react"

import type { AppModule } from "@/lib/module"

export const commsModule: AppModule = {
  id: "comms",
  title: "Communications",
  group: "apps",
  icon: <MegaphoneIcon />,
  routes: [
    {
      path: "comms",
      title: "Overview",
      nav: "Overview",
      element: React.lazy(() => import("./page")),
    },
    {
      path: "comms/compose",
      title: "Compose",
      nav: "Compose",
      element: React.lazy(() => import("./compose-page")),
    },
    {
      path: "comms/list",
      title: "All Communications",
      nav: "All Communications",
      nested: true,
      element: React.lazy(() => import("./list-page")),
    },
    {
      path: "comms/list/:commId",
      title: "Communication Details",
      element: React.lazy(() => import("./details-page")),
    },
    {
      path: "comms/templates",
      title: "Templates",
      nav: "Templates",
      element: React.lazy(() => import("./templates-page")),
    },
    {
      path: "comms/approvals",
      title: "Approvals",
      nav: "Approvals",
      element: React.lazy(() => import("./approvals-page")),
    },
  ],
}
