import * as React from "react"
import { UsersIcon } from "lucide-react"

import type { AppModule } from "@/lib/module"

export const teamModule: AppModule = {
  id: "team",
  title: "Team",
  group: "main",
  icon: <UsersIcon />,
  routes: [
    {
      path: "team",
      title: "Team",
      nav: "Team",
      element: React.lazy(() => import("./page")),
    },
    {
      path: "team/:memberId",
      title: "Team Member",
      element: React.lazy(() => import("./member-page")),
    },
  ],
}
