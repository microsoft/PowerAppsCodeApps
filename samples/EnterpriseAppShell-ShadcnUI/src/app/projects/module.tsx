import * as React from "react"
import { FolderIcon } from "lucide-react"

import type { AppModule } from "@/lib/module"

export const projectsModule: AppModule = {
  id: "projects",
  title: "Projects",
  group: "apps",
  icon: <FolderIcon />,
  routes: [
    {
      path: "projects",
      title: "Projects",
      nav: "Dashboard",
      element: React.lazy(() => import("./page")),
    },
    {
      path: "projects/list",
      title: "All Projects",
      nav: "List",
      element: React.lazy(() => import("./list-page")),
    },
    {
      path: "projects/overview",
      title: "Projects Overview",
      nav: "Overview",
      element: React.lazy(() => import("./overview-page")),
    },
    {
      path: "projects/create",
      title: "Create Project",
      nav: "Create Project",
      element: React.lazy(() => import("./create-page")),
    },
    {
      path: "projects/details/:projectId",
      title: "Project Details",
      element: React.lazy(() => import("./details-page")),
    },
  ],
}
